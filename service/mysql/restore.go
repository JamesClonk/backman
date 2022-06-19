package mysql

import (
	"bufio"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/state"
)

func Restore(ctx context.Context, s3 *s3.Client, service config.Service, binding *cfenv.Service, objectPath string) error {
	state.RestoreQueue(service)

	// lock global mysql mutex, only 1 backup/restore operation of this service-type is allowed to run in parallel
	// to avoid issues with setting MYSQL* environment variables and memory consumption
	mysqlMutex.Lock()
	defer mysqlMutex.Unlock()

	filename := filepath.Base(objectPath)
	state.RestoreStart(service, filename)

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
	command = append(command, service.RestoreOptions...)

	log.Debugf("executing mysql restore command: %v", strings.Join(command, " "))
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)

	downloadCtx, downloadCancel := context.WithCancel(ctx) // allows download to be cancelable, in case restore times out
	defer downloadCancel()                                 // cancel download in case Restore() exits before downloadWait is done

	// un-gzipping for stdin
	s3Reader, err := s3.DownloadWithContext(downloadCtx, objectPath)
	if err != nil {
		log.Errorf("could not download service backup [%s] from S3: %v", service.Name, err)
		state.RestoreFailure(service, filename)
		return err
	}
	defer s3Reader.Close()
	gzipReader, err := gzip.NewReader(s3Reader)
	if err != nil {
		log.Errorf("could not open gzip reader: %v", err)
		state.RestoreFailure(service, filename)
		return err
	}
	defer gzipReader.Close()

	// Reads are buffered to be at least buff size long
	backupReader := bufio.NewReaderSize(gzipReader, 65536 /* default 4096 seems small for a backup file */)
	stdin, err := cmd.StdinPipe()
	if err != nil {
		log.Errorf("could not open stdin pipe: %v", err)
		state.RestoreFailure(service, filename)
		return err
	}

	// Pipe data from the backup reader to cmd's stdin
	go func() {
		defer stdin.Close()
		bytesRead, err := io.Copy(stdin, backupReader)
		if err != nil {
			log.Errorf("could not copy backup to cmd's stdin: %v", err)
			return
		}
		log.Infof("Copied %d bytes of backup", bytesRead)
	}()

	// print out stdout/stderr
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run mysql restore: %v", err)
		state.RestoreFailure(service, filename)
		return err
	}

	if err := cmd.Wait(); err != nil {
		state.RestoreFailure(service, filename)
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("mysql restore: timeout: %v", ctx.Err())
		}
		return fmt.Errorf("mysql restore: %v", err)
	}

	if err == nil {
		state.RestoreSuccess(service, filename)
	}
	return err
}
