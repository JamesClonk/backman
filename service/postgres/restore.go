package postgres

import (
	"bufio"
	"compress/gzip"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
)

func Restore(ctx context.Context, s3 *s3.Client, binding *cfenv.Service, objectPath string) error {
	// lock global postgres mutex, only 1 backup of this service-type is allowed to run in parallel
	// to avoid issues with setting PG* environment variables and memory consumption
	pgMutex.Lock()
	defer pgMutex.Unlock()

	host, _ := binding.CredentialString("host")
	database, _ := binding.CredentialString("database")
	username, _ := binding.CredentialString("username")
	password, _ := binding.CredentialString("password")
	port, _ := binding.CredentialString("port")
	if len(port) == 0 {
		switch p := binding.Credentials["port"].(type) {
		case float64:
			port = strconv.Itoa(int(p))
		case int, int32, int64:
			port = strconv.Itoa(p.(int))
		}
	}

	os.Setenv("PGUSER", username)
	os.Setenv("PGPASSWORD", password)
	os.Setenv("PGHOST", host)
	os.Setenv("PGPORT", port)

	// prepare postgres restore command
	var command []string
	command = append(command, "psql")
	command = append(command, "--quiet")
	command = append(command, database)

	log.Debugf("executing postgres restore command: %v", strings.Join(command, " "))
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)

	downloadCtx, downloadCancel := context.WithCancel(context.Background()) // allows download to be cancelable, in case restore times out
	defer downloadCancel()                                                  // cancel download in case Restore() exits before downloadWait is done

	// un-gzipping for stdin
	reader, err := s3.DownloadWithContext(downloadCtx, objectPath)
	if err != nil {
		log.Errorf("could not download service backup [%s] from S3: %v", binding.Name, err)
		return err
	}
	defer reader.Close()
	gr, err := gzip.NewReader(reader)
	if err != nil {
		log.Errorf("could not open gzip reader: %v", err)
		return err
	}
	defer gr.Close()
	cmd.Stdin = bufio.NewReader(gr)

	// print out stdout/stderr
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run postgres restore: %v", err)
		return err
	}

	if err := cmd.Wait(); err != nil {
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("postgres restore: timeout: %v", ctx.Err())
		}
		return fmt.Errorf("postgres restore: %v", err)
	}
	return err
}
