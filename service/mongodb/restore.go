package mongodb

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/JamesClonk/backman/log"
	"github.com/JamesClonk/backman/s3"
	"github.com/cloudfoundry-community/go-cfenv"
)

func Restore(ctx context.Context, s3 *s3.Client, binding *cfenv.Service, objectPath string) error {
	// lock global mongodb mutex, only 1 backup of this service-type is allowed to run in parallel
	mongoMutex.Lock()
	defer mongoMutex.Unlock()

	uri, _ := binding.CredentialString("uri")

	// prepare mongorestore command
	var command []string
	command = append(command, "mongorestore")
	command = append(command, "--uri")
	command = append(command, uri)
	command = append(command, "--gzip")
	command = append(command, "--archive")

	log.Debugf("executing mongodb restore command: %v", strings.Join(command, " "))
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)

	downloadCtx, downloadCancel := context.WithCancel(context.Background()) // allows download to be cancelable, in case restore times out
	defer downloadCancel()                                                  // cancel download in case Restore() exits before downloadWait is done

	// streaming from S3 for stdin
	reader, err := s3.DownloadWithContext(downloadCtx, objectPath)
	if err != nil {
		log.Errorf("could not download service backup [%s] from S3: %v", binding.Name, err)
		return err
	}
	defer reader.Close()
	cmd.Stdin = bufio.NewReader(reader)

	// print out stdout/stderr
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run mongorestore: %v", err)
		return err
	}

	if err := cmd.Wait(); err != nil {
		// check for timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("mongorestore: timeout: %v", ctx.Err())
		}
		return fmt.Errorf("mongorestore: %v", err)
	}
	return err
}
