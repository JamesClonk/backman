package elasticsearch

import (
	"bufio"
	"compress/gzip"
	"context"
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/state"
)

func Restore(ctx context.Context, s3 *s3.Client, service config.Service, target config.Service, objectPath string) error {
	state.RestoreQueue(service)

	// lock global elasticsearch mutex, only 1 backup/restore operation of this service-type is allowed to run in parallel
	esMutex.Lock()
	defer esMutex.Unlock()

	filename := filepath.Base(objectPath)
	state.RestoreStart(service, filename)

	u, _ := url.Parse(target.Binding.Host)
	connectstring := fmt.Sprintf("%s://%s:%s@%s",
		u.Scheme,
		url.PathEscape(target.Binding.Username),
		url.PathEscape(target.Binding.Password),
		u.Host)

	// prepare elasticsearch restore command
	var command []string
	command = append(command, "elasticdump")
	command = append(command, "--quiet")
	command = append(command, fmt.Sprintf("--output=%s", connectstring))

	// stream from stdin (default behaviour) or directly from s3 (new behaviour)?
	if service.DirectS3 {
		command = append(command, fmt.Sprintf("--input=s3://%s/%s", s3.BucketName, objectPath))
		command = append(command, "--s3Endpoint")
		command = append(command, s3.Endpoint)
		command = append(command, "--s3AccessKeyId")
		command = append(command, s3.AccessKey)
		command = append(command, "--s3SecretAccessKey")
		command = append(command, s3.SecretKey)
		command = append(command, "--s3Compress")
		command = append(command, service.BackupOptions...)

		log.Debugf("executing elasticsearch direct S3 restore command: %v", strings.Join(command, " "))
		cmd := exec.CommandContext(ctx, command[0], command[1:]...)

		if err := cmd.Run(); err != nil {
			log.Errorf("could not run elasticsearch restore: %v", err)
			state.RestoreFailure(service, filename)

			// check for timeout error
			if ctx.Err() == context.DeadlineExceeded {
				return fmt.Errorf("elasticsearch restore: timeout: %v", ctx.Err())
			}
			return fmt.Errorf("elasticsearch restore: %v", err)
		}
		state.RestoreSuccess(service, filename)

	} else {
		command = append(command, "--input=$")
		command = append(command, service.RestoreOptions...)

		log.Debugf("executing elasticsearch restore command: %v", strings.Join(command, " "))
		cmd := exec.CommandContext(ctx, command[0], command[1:]...)

		downloadCtx, downloadCancel := context.WithCancel(ctx) // allows download to be cancelable, in case restore times out
		defer downloadCancel()                                 // cancel download in case Restore() exits before downloadWait is done

		// un-gzipping for stdin
		reader, err := s3.DownloadWithContext(downloadCtx, objectPath)
		if err != nil {
			log.Errorf("could not download service backup [%s] from S3: %v", service.Name, err)
			state.RestoreFailure(service, filename)
			return err
		}
		defer reader.Close()
		gr, err := gzip.NewReader(reader)
		if err != nil {
			log.Errorf("could not open gzip reader: %v", err)
			state.RestoreFailure(service, filename)
			return err
		}
		defer gr.Close()
		cmd.Stdin = bufio.NewReader(gr)

		// print out stdout/stderr
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Start(); err != nil {
			log.Errorf("could not run elasticsearch restore: %v", err)
			state.RestoreFailure(service, filename)
			return err
		}

		if err := cmd.Wait(); err != nil {
			state.RestoreFailure(service, filename)
			// check for timeout error
			if ctx.Err() == context.DeadlineExceeded {
				return fmt.Errorf("elasticsearch restore: timeout: %v", ctx.Err())
			}
			return fmt.Errorf("elasticsearch restore: %v", err)
		}

		if err == nil {
			state.RestoreSuccess(service, filename)
		}
	}
	return nil
}
