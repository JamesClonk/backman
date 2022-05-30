package elasticsearch

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"net/url"
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

var esMutex = &sync.Mutex{}

func Backup(ctx context.Context, s3 *s3.Client, service util.Service, binding *cfenv.Service, filename string) error {
	state.BackupQueue(service)

	// lock global elasticsearch mutex, only 1 backup/restore operation of this service-type is allowed to run in parallel
	esMutex.Lock()
	defer esMutex.Unlock()

	state.BackupStart(service, filename)

	host, _ := binding.CredentialString("host")
	username, _ := binding.CredentialString("full_access_username")
	password, _ := binding.CredentialString("full_access_password")
	if len(username) == 0 {
		username, _ = binding.CredentialString("username")
	}
	if len(password) == 0 {
		password, _ = binding.CredentialString("password")
	}

	u, _ := url.Parse(host)
	connectstring := fmt.Sprintf("%s://%s:%s@%s", u.Scheme, url.PathEscape(username), url.PathEscape(password), u.Host)
	objectPath := fmt.Sprintf("%s/%s/%s", service.Label, service.Name, filename)

	// prepare elasticdump command
	var command []string
	command = append(command, "elasticdump")
	command = append(command, "--quiet")
	command = append(command, fmt.Sprintf("--input=%s", connectstring))

	// stream to stdout (default behaviour) or directly onto s3 (new behaviour)?
	if service.DirectS3 {
		command = append(command, fmt.Sprintf("--output=s3://%s/%s", s3.BucketName, objectPath))
		command = append(command, "--s3Endpoint")
		command = append(command, s3.Endpoint)
		command = append(command, "--s3AccessKeyId")
		command = append(command, s3.AccessKey)
		command = append(command, "--s3SecretAccessKey")
		command = append(command, s3.SecretKey)
		command = append(command, "--s3Compress")
		command = append(command, service.BackupOptions...)

		log.Debugf("executing elasticsearch direct S3 backup command: %v", strings.Join(command, " "))
		cmd := exec.CommandContext(ctx, command[0], command[1:]...)

		if err := cmd.Run(); err != nil {
			log.Errorf("could not run elasticdump: %v", err)
			state.BackupFailure(service, filename)

			// check for timeout error
			if ctx.Err() == context.DeadlineExceeded {
				return fmt.Errorf("elasticdump: timeout: %v", ctx.Err())
			}
			return fmt.Errorf("elasticdump: %v", err)
		}
		time.Sleep(1 * time.Second)
		state.BackupSuccess(service, filename)

	} else {
		command = append(command, "--output=$")
		command = append(command, service.BackupOptions...)

		log.Debugf("executing elasticsearch backup command: %v", strings.Join(command, " "))
		cmd := exec.CommandContext(ctx, command[0], command[1:]...)

		// capture stdout to pass to gzipping buffer
		outPipe, err := cmd.StdoutPipe()
		if err != nil {
			log.Errorf("could not get stdout pipe for elasticdump: %v", err)
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
			log.Errorf("could not run elasticdump: %v", err)
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
				return fmt.Errorf("elasticdump: timeout: %v", ctx.Err())
			}

			log.Errorln(strings.TrimRight(errBuf.String(), "\r\n"))
			return fmt.Errorf("elasticdump: %v", err)
		}

		uploadWait.Wait() // wait for upload to have finished
		if err == nil {
			state.BackupSuccess(service, filename)
		}

		if service.LogStdErr {
			log.Infoln(strings.TrimRight(errBuf.String(), "\r\n"))
		}
	}
	return nil
}
