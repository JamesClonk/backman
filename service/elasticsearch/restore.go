package elasticsearch

import (
	"bufio"
	"compress/gzip"
	"context"
	"fmt"
	"net/url"
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

	// lock global elasticsearch mutex, only 1 backup/restore operation of this service-type is allowed to run in parallel
	esMutex.Lock()
	defer esMutex.Unlock()

	state.RestoreStart(service)

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
	connectstring := fmt.Sprintf("%s://%s:%s@%s", u.Scheme, username, password, u.Host)

	// prepare elasticsearch restore command
	var command []string
	command = append(command, "elasticdump")
	command = append(command, "--quiet")
	command = append(command, "--input=$")
	command = append(command, fmt.Sprintf("--output=%s", connectstring))

	log.Debugf("executing elasticsearch restore command: %v", strings.Join(command, " "))
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
		log.Errorf("could not run elasticsearch restore: %v", err)
		state.RestoreFailure(service)
		return err
	}

	if err := cmd.Wait(); err != nil {
		state.RestoreFailure(service)
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("elasticsearch restore: timeout: %v", ctx.Err())
		}
		return fmt.Errorf("elasticsearch restore: %v", err)
	}

	if err == nil {
		state.RestoreSuccess(service)
	}
	return err
}
