package postgres

import (
	"bufio"
	"compress/gzip"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/service/util"
	"github.com/swisscom/backman/state"
)

func Restore(ctx context.Context, s3 *s3.Client, service util.Service, binding *cfenv.Service, objectPath string) error {
	state.RestoreQueue(service)

	// lock global postgres mutex, only 1 backup of this service-type is allowed to run in parallel
	// to avoid issues with setting PG* environment variables and memory consumption
	pgMutex.Lock()
	defer pgMutex.Unlock()

	filename := filepath.Base(objectPath)
	state.RestoreStart(service, filename)

	credentials := GetCredentials(binding)
	os.Setenv("PGUSER", credentials.Username)
	os.Setenv("PGPASSWORD", credentials.Password)
	os.Setenv("PGHOST", credentials.Hostname)
	os.Setenv("PGPORT", credentials.Port)

	// prepare postgres restore command
	var command []string
	command = append(command, "psql")
	command = append(command, "--quiet")
	command = append(command, service.RestoreOptions...)
	command = append(command, credentials.Database)

	log.Debugf("executing postgres restore command: %v", strings.Join(command, " "))
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
		log.Errorf("could not run postgres restore: %v", err)
		state.RestoreFailure(service, filename)
		return err
	}

	if err := cmd.Wait(); err != nil {
		state.RestoreFailure(service, filename)
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("postgres restore: timeout: %v", ctx.Err())
		}
		return fmt.Errorf("postgres restore: %v", err)
	}

	if err == nil {
		state.RestoreSuccess(service, filename)
	}
	return err
}
