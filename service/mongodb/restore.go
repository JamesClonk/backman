package mongodb

import (
	"bufio"
	"context"
	"fmt"
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

	// lock global mongodb mutex, only 1 backup of this service-type is allowed to run in parallel
	mongoMutex.Lock()
	defer mongoMutex.Unlock()

	filename := filepath.Base(objectPath)
	state.RestoreStart(service, filename)

	// prepare mongorestore command
	var command []string
	command = append(command, "mongorestore")
	command = append(command, "--uri")
	command = append(command, service.Binding.URI)
	command = append(command, "--gzip")
	command = append(command, "--archive")
	command = append(command, service.RestoreOptions...)

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

	log.Debugf("executing mongodb restore command: %v", strings.Join(command, " "))
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)

	downloadCtx, downloadCancel := context.WithCancel(ctx) // allows download to be cancelable, in case restore times out
	defer downloadCancel()                                 // cancel download in case Restore() exits before downloadWait is done

	// streaming from S3 for stdin
	reader, err := s3.DownloadWithContext(downloadCtx, objectPath)
	if err != nil {
		log.Errorf("could not download service backup [%s] from S3: %v", service.Name, err)
		state.RestoreFailure(service, filename)
		return err
	}
	defer reader.Close()
	cmd.Stdin = bufio.NewReader(reader)

	// print out stdout/stderr
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run mongorestore: %v", err)
		state.RestoreFailure(service, filename)
		return err
	}

	if err := cmd.Wait(); err != nil {
		state.RestoreFailure(service, filename)
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("mongorestore: timeout: %v", ctx.Err())
		}
		return fmt.Errorf("mongorestore: %v", err)
	}

	if err == nil {
		state.RestoreSuccess(service, filename)
	}
	return err
}
