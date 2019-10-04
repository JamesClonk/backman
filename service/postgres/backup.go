package postgres

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/service/util"
	"github.com/swisscom/backman/state"
)

var pgMutex = &sync.Mutex{}

func Backup(ctx context.Context, s3 *s3.Client, service util.Service, binding *cfenv.Service, filename string) error {
	state.BackupQueue(service)

	// lock global postgres mutex, only 1 backup of this service-type is allowed to run in parallel
	// to avoid issues with setting PG* environment variables and memory consumption
	pgMutex.Lock()
	defer pgMutex.Unlock()

	state.BackupStart(service)

	credentials := GetCredentials(binding)
	os.Setenv("PGUSER", credentials.Username)
	os.Setenv("PGPASSWORD", credentials.Password)
	os.Setenv("PGHOST", credentials.Hostname)
	os.Setenv("PGPORT", credentials.Port)

	// prepare postgres dump command
	var command []string
	if len(credentials.Database) > 0 {
		command = append(command, "pg_dump")
		command = append(command, credentials.Database)
		command = append(command, "-C")
	} else {
		command = append(command, "pg_dumpall")
	}
	command = append(command, "-c")
	command = append(command, "--no-password")

	log.Debugf("executing postgres backup command: %v", strings.Join(command, " "))
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)

	// capture stdout to pass to gzipping buffer
	outPipe, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("could not get stdout pipe for postgres dump: %v", err)
		state.BackupFailure(service)
		return err
	}
	defer outPipe.Close()

	var uploadWait sync.WaitGroup
	uploadCtx, uploadCancel := context.WithCancel(context.Background()) // allows upload to be cancelable, in case backup times out
	defer uploadCancel()                                                // cancel upload in case Backup() exits before uploadWait is done

	// start upload in background, streaming output onto S3
	uploadWait.Add(1)
	go func() {
		defer uploadWait.Done()

		// gzipping stdout
		pr, pw := io.Pipe()
		gw := gzip.NewWriter(pw)
		gw.Name = strings.TrimSuffix(filename, ".gz")
		gw.ModTime = time.Now()
		go func() {
			_, _ = io.Copy(gw, bufio.NewReader(outPipe))
			if err := gw.Flush(); err != nil {
				log.Errorf("%v", err)
			}
			if err := gw.Close(); err != nil {
				log.Errorf("%v", err)
			}
			if err := pw.Close(); err != nil {
				log.Errorf("%v", err)
			}
		}()

		objectPath := fmt.Sprintf("%s/%s/%s", service.Label, service.Name, filename)
		err = s3.UploadWithContext(uploadCtx, objectPath, pr, -1)
		if err != nil {
			log.Errorf("could not upload service backup [%s] to S3: %v", service.Name, err)
		}
	}()
	time.Sleep(2 * time.Second) // wait for upload goroutine to be ready

	// capture and read stderr in case an error occurs
	var errBuf bytes.Buffer
	cmd.Stderr = &errBuf

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run postgres dump: %v", err)
		state.BackupFailure(service)
		return err
	}

	if err := cmd.Wait(); err != nil {
		state.BackupFailure(service)
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("postgres dump: timeout: %v", ctx.Err())
		}

		log.Errorln(strings.TrimRight(errBuf.String(), "\r\n"))
		return fmt.Errorf("postgres dump: %v", err)
	}

	uploadWait.Wait() // wait for upload to have finished
	if err == nil {
		state.BackupSuccess(service)
	}
	return err
}
