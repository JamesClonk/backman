package mongodb

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"strings"
	"sync"

	cfenv "github.com/cloudfoundry-community/go-cfenv"

	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/s3"
)

var mongoMutex = &sync.Mutex{}

func Backup(ctx context.Context, s3 *s3.Client, binding *cfenv.Service, filename string) error {
	// lock global mongodb mutex, only 1 backup of this service-type is allowed to run in parallel
	mongoMutex.Lock()
	defer mongoMutex.Unlock()

	host, _ := binding.CredentialString("host")
	port, _ := binding.CredentialString("port")
	database, _ := binding.CredentialString("database")
	username, _ := binding.CredentialString("username")
	password, _ := binding.CredentialString("password")

	// prepare mongodump command
	var command []string
	command = append(command, "mongodump")
	command = append(command, "--host")
	command = append(command, fmt.Sprintf("%s:%s", host, port))
	command = append(command, "--authenticationDatabase")
	command = append(command, database)
	command = append(command, "-d")
	command = append(command, database)
	command = append(command, "-u")
	command = append(command, username)
	command = append(command, "-p")
	command = append(command, password)
	command = append(command, "--gzip")
	command = append(command, "--archive")

	log.Debugf("executing mongodb backup command: %v", strings.Join(command, " "))
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)

	// capture stdout to pass to gzipping buffer
	outPipe, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("could not get stdout pipe for mongodump: %v", err)
		return err
	}

	// capture and read stderr in case an error occurs
	var errBuf bytes.Buffer
	cmd.Stderr = &errBuf

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run mongodump: %v", err)
		return err
	}

	var uploadWait sync.WaitGroup
	uploadCtx, uploadCancel := context.WithCancel(context.Background()) // allows upload to be cancelable, in case backup times out
	defer uploadCancel()                                                // cancel upload in case Backup() exits before uploadWait is done
	go func() {
		uploadWait.Add(1)
		defer uploadWait.Done()

		objectPath := fmt.Sprintf("%s/%s/%s", binding.Label, binding.Name, filename)
		err = s3.UploadWithContext(uploadCtx, objectPath, outPipe, -1)
		if err != nil {
			log.Errorf("could not upload service backup [%s] to S3: %v", binding.Name, err)
		}
	}()

	if err := cmd.Wait(); err != nil {
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("mongodump: timeout: %v", ctx.Err())
		}

		log.Errorln(strings.TrimRight(errBuf.String(), "\r\n"))
		return fmt.Errorf("mongodump: %v", err)
	}

	uploadWait.Wait() // wait for upload to have finished
	return err
}
