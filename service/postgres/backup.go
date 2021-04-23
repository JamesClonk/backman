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
	"path/filepath"
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

	state.BackupStart(service, filename)

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
	command = append(command, service.BackupOptions...)

	// store backup file locally first, before uploading it onto s3
	if len(service.LocalBackupPath) > 0 {
		// output path
		outputPath := filepath.Join(service.LocalBackupPath, service.Label, service.Name)
		_ = os.MkdirAll(outputPath, 0750)

		// output filenames for backup
		backupFilenameGz := filepath.Join(outputPath, filename)
		backupFilename := strings.TrimSuffix(backupFilenameGz, ".gz")

		// add --file to pg_dump command, no stdout redirection
		command = append(command, "-f")
		command = append(command, backupFilename)
		command = append(command, "--format=plain")
		log.Debugf("executing postgres backup command: %v", strings.Join(command, " "))
		cmd := exec.CommandContext(ctx, command[0], command[1:]...)
		cmd.Stderr = os.Stderr

		if err := cmd.Run(); err != nil {
			log.Errorf("could not run postgres dump: %v", err)
			state.BackupFailure(service, filename)
			defer os.Remove(backupFilename)

			// check for timeout error
			if ctx.Err() == context.DeadlineExceeded {
				return fmt.Errorf("postgres dump: timeout: %v", ctx.Err())
			}
			return fmt.Errorf("postgres dump: %v", err)
		}
		time.Sleep(1 * time.Second)

		// gzip file
		if err := exec.CommandContext(ctx, "gzip", backupFilename).Run(); err != nil {
			log.Errorf("could not gzip postgres backup file: %v", err)
			state.BackupFailure(service, filename)
			return err
		}
		time.Sleep(1 * time.Second)

		// get io.reader for backup file
		backupFile, err := os.Open(backupFilenameGz)
		if err != nil {
			log.Errorf("could not open postgres backup file for s3 upload: %v", err)
			state.BackupFailure(service, filename)
			return err
		}
		defer backupFile.Close()

		// upload file to s3
		uploadCtx, uploadCancel := context.WithCancel(context.Background()) // allows upload to be cancelable, in case backup times out
		defer uploadCancel()
		objectPath := fmt.Sprintf("%s/%s/%s", service.Label, service.Name, filename)
		if err := s3.UploadWithContext(uploadCtx, objectPath, backupFile, -1); err != nil {
			log.Errorf("could not upload service backup [%s] to S3: %v", service.Name, err)
			state.BackupFailure(service, filename)
		}
		time.Sleep(1 * time.Second)

		if err == nil {
			state.BackupSuccess(service, filename)
		}
		return err

	} else { // stream pg_dump directly onto s3
		log.Debugf("executing postgres backup command: %v", strings.Join(command, " "))
		cmd := exec.CommandContext(ctx, command[0], command[1:]...)

		// capture stdout to pass to gzipping buffer
		outPipe, err := cmd.StdoutPipe()
		if err != nil {
			log.Errorf("could not get stdout pipe for postgres dump: %v", err)
			state.BackupFailure(service, filename)
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

			// gzipping stdout, pass to gzipping buffer
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
				state.BackupFailure(service, filename)
			}
		}()
		time.Sleep(2 * time.Second) // wait for upload goroutine to be ready

		// capture and read stderr in case an error occurs
		var errBuf bytes.Buffer
		cmd.Stderr = &errBuf

		if err := cmd.Start(); err != nil {
			log.Errorf("could not run postgres dump: %v", err)
			state.BackupFailure(service, filename)
			return err
		}

		if err := cmd.Wait(); err != nil {
			state.BackupFailure(service, filename)
			// check for timeout error
			if ctx.Err() == context.DeadlineExceeded {
				return fmt.Errorf("postgres dump: timeout: %v", ctx.Err())
			}

			log.Errorln(strings.TrimRight(errBuf.String(), "\r\n"))
			return fmt.Errorf("postgres dump: %v", err)
		}

		uploadWait.Wait() // wait for upload to have finished
		if err == nil {
			state.BackupSuccess(service, filename)
		}
		return err
	}
	return nil
}
