package mysql

import (
	"bufio"
	"compress/gzip"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/service/util"
	"github.com/swisscom/backman/state"
)

func Restore(ctx context.Context, s3 *s3.Client, service util.Service, binding *cfenv.Service, objectPath string) error {
	state.RestoreQueue(service)

	// lock global mysql mutex, only 1 backup/restore operation of this service-type is allowed to run in parallel
	// to avoid issues with setting MYSQL* environment variables and memory consumption
	mysqlMutex.Lock()
	defer mysqlMutex.Unlock()

	state.RestoreStart(service)

	credentials := GetCredentials(binding)
	os.Setenv("MYSQL_PWD", credentials.Password)

	// prepare mysql restore command
	var command []string
	command = append(command, "mysql")
	command = append(command, credentials.Database)
	command = append(command, "-h")
	command = append(command, credentials.Hostname)
	command = append(command, "-P")
	command = append(command, credentials.Port)
	command = append(command, "-u")
	command = append(command, credentials.Username)
	// https://stackoverflow.com/questions/11263018/mysql-ignore-errors-when-importing/25771417#25771417
	if service.ForceImport {
		command = append(command, "--force")
	}

	log.Debugf("executing mysql restore command: %v", strings.Join(command, " "))
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)

	downloadCtx, downloadCancel := context.WithCancel(context.Background()) // allows download to be cancelable, in case restore times out
	defer downloadCancel()                                                  // cancel download in case Restore() exits before downloadWait is done

	// un-gzipping for stdin
	reader, err := s3.DownloadWithContext(downloadCtx, objectPath)
	if err != nil {
		log.Errorf("could not download service backup [%s] from S3: %v", service.Name, err)
		state.RestoreFailure(service)
		return err
	}
	defer reader.Close()
	gr, err := gzip.NewReader(reader)
	if err != nil {
		log.Errorf("could not open gzip reader: %v", err)
		state.RestoreFailure(service)
		return err
	}
	defer gr.Close()
	cmd.Stdin = bufio.NewReader(gr)

	// print out stdout/stderr
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run mysql restore: %v", err)
		state.RestoreFailure(service)
		return err
	}

	if err := cmd.Wait(); err != nil {
		state.RestoreFailure(service)
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("mysql restore: timeout: %v", ctx.Err())
		}
		return fmt.Errorf("mysql restore: %v", err)
	}

	if err == nil {
		state.RestoreSuccess(service)
	}
	return err
}
