package mongodb

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/state"
)

var mongoMutex = &sync.Mutex{}

func Backup(ctx context.Context, s3 *s3.Client, service config.Service, filename string) error {
	state.BackupQueue(service)

	// lock global mongodb mutex, only 1 backup of this service-type is allowed to run in parallel
	mongoMutex.Lock()
	defer mongoMutex.Unlock()

	state.BackupStart(service, filename)

	// prepare mongodump command
	var command []string
	command = append(command, "mongodump")
	command = append(command, "--uri")
	command = append(command, service.Binding.URI)
	command = append(command, "--readPreference")
	command = append(command, service.ReadPreference)
	command = append(command, "--gzip")
	command = append(command, "--archive")
	command = append(command, service.BackupOptions...)

	// ssl/tls
	if len(service.Binding.SSL.PEMKeyPath) > 0 || len(service.Binding.SSL.CACertPath) > 0 {
		command = append(command, "--ssl")
	}

	if len(service.Binding.SSL.PEMKeyPath) > 0 {
		command = append(command, "--sslPEMKeyFile="+service.Binding.SSL.PEMKeyPath)

		if len(service.Binding.SSL.PEMKeyPassword) > 0 {
			command = append(command, "--sslPEMKeyPassword='"+service.Binding.SSL.PEMKeyPassword+"'")
		}
	}

	if len(service.Binding.SSL.CACertPath) > 0 {
		command = append(command, "--sslCAFile="+service.Binding.SSL.CACertPath)
	}

	log.Debugf("executing mongodb backup command: %v", strings.Join(command, " "))
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)

	// capture stdout to pass to gzipping buffer
	outPipe, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("could not get stdout pipe for mongodump: %v", err)
		state.BackupFailure(service, filename)
		return err
	}
	defer outPipe.Close()

	var uploadWait sync.WaitGroup
	uploadCtx, uploadCancel := context.WithCancel(ctx) // allows upload to be cancelable, in case backup times out
	defer uploadCancel()                               // cancel upload in case Backup() exits before uploadWait is done

	// start upload in background, streaming output onto S3
	uploadWait.Add(1)
	go func() {
		defer uploadWait.Done()

		pr, pw := io.Pipe()
		defer pw.Close()

		go func() {
			_, _ = io.Copy(pw, bufio.NewReader(outPipe))
			if err := pw.Close(); err != nil {
				log.Errorf("%v", err)
			}
		}()

		objectPath := fmt.Sprintf("%s/%s/%s", service.Binding.Type, service.Name, filename)
		err = s3.UploadWithContext(uploadCtx, objectPath, pr, -1)
		if err != nil {
			log.Errorf("could not upload service backup [%s] to S3: %v", service.Name, err)
			state.BackupFailure(service, filename)
		}
		time.Sleep(1 * time.Second) // wait pipe to be closed
	}()
	time.Sleep(3 * time.Second) // wait for upload goroutine to be ready

	// capture and read stderr in case an error occurs
	var errBuf bytes.Buffer
	cmd.Stderr = &errBuf

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run mongodump: %v", err)
		state.BackupFailure(service, filename)
		return err
	}

	if err := cmd.Wait(); err != nil {
		state.BackupFailure(service, filename)
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			if service.LogStdErr {
				log.Errorln(strings.TrimRight(errBuf.String(), "\r\n"))
			}
			return fmt.Errorf("mongodump: timeout: %v", ctx.Err())
		}

		log.Errorln(strings.TrimRight(errBuf.String(), "\r\n"))
		return fmt.Errorf("mongodump: %v", err)
	}

	uploadWait.Wait() // wait for upload to have finished
	if err == nil {
		state.BackupSuccess(service, filename)
	}

	if service.LogStdErr {
		log.Infoln(strings.TrimRight(errBuf.String(), "\r\n"))
	}
	return err
}
