package redis

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/service/util"
	"github.com/swisscom/backman/state"
)

var redisMutex = &sync.Mutex{}

func Backup(ctx context.Context, s3 *s3.Client, service util.Service, binding *cfenv.Service, filename string) error {
	state.BackupQueue(service)

	// lock global redis mutex, only 1 backup of this service-type is allowed to run in parallel
	// to avoid issues with memory and disk space consumption
	redisMutex.Lock()
	defer redisMutex.Unlock()

	state.BackupStart(service, filename)

	credentials := GetCredentials(binding)

	// tmp file
	_ = os.Mkdir("tmp", os.ModePerm)
	localFilename := filepath.Join("tmp", strings.TrimSuffix(filename, ".gz"))
	localFilenameGzipped := filepath.Join("tmp", filename)

	// prepare redis dump command
	var command []string
	command = append(command, "redis-cli")
	command = append(command, "-h")
	command = append(command, credentials.Hostname)
	command = append(command, "-p")
	command = append(command, credentials.Port)
	command = append(command, "-a")
	command = append(command, credentials.Password)
	command = append(command, "--rdb")
	command = append(command, localFilename)
	command = append(command, service.BackupOptions...)

	log.Debugf("executing redis backup command: %v", strings.Join(command, " "))
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)

	// capture and read stderr in case an error occurs
	var errBuf bytes.Buffer
	cmd.Stderr = &errBuf

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run redis dump: %v", err)
		state.BackupFailure(service, filename)
		return fmt.Errorf("redis dump: %v", err)
	}
	if err := cmd.Wait(); err != nil {
		state.BackupFailure(service, filename)
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("redis dump: timeout: %v", ctx.Err())
		}

		log.Errorln(strings.TrimRight(errBuf.String(), "\r\n"))
		return fmt.Errorf("redis dump: %v", err)
	}

	// gzip file
	log.Debugf("gzipping redis dump [%s]", localFilename)
	cmd = exec.CommandContext(ctx, "gzip", localFilename)
	if err := cmd.Run(); err != nil {
		log.Errorf("could not gzip redis dump [%s]: %v", localFilename, err)
		state.BackupFailure(service, filename)
		return fmt.Errorf("redis dump: %v", err)
	}

	// upload file
	uploadCtx, uploadCancel := context.WithCancel(context.Background()) // allows upload to be cancelable, in case backup times out
	defer uploadCancel()

	uploadfile, err := os.Open(localFilenameGzipped)
	if err != nil {
		log.Errorf("could not open local redis dump [%s]: %v", localFilenameGzipped, err)
		state.BackupFailure(service, filename)
		return fmt.Errorf("redis dump: %v", err)
	}
	defer uploadfile.Close()

	objectPath := fmt.Sprintf("%s/%s/%s", service.Label, service.Name, filename)
	err = s3.UploadWithContext(uploadCtx, objectPath, uploadfile, -1)
	if err != nil {
		log.Errorf("could not upload service backup [%s] to S3: %v", service.Name, err)
		state.BackupFailure(service, filename)
	}

	// delete local file again
	defer os.Remove(localFilenameGzipped)

	if err == nil {
		state.BackupSuccess(service, filename)
	}
	return err
}
