package postgres

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"

	"github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
)

func Backup(service *cfenv.Service, upload func(io.Reader)) error {
	host, _ := service.CredentialString("host")
	port, _ := service.CredentialString("port")
	database, _ := service.CredentialString("database")
	username, _ := service.CredentialString("username")
	password, _ := service.CredentialString("password")

	os.Setenv("PGUSER", username)
	os.Setenv("PGPASSWORD", password)
	os.Setenv("PGHOST", host)
	os.Setenv("PGPORT", port)

	// prepare postgres dump command
	var command []string
	if len(database) > 0 {
		command = append(command, "pg_dump")
		command = append(command, database)
		command = append(command, "-C")
	} else {
		command = append(command, "pg_dumpall")
	}
	command = append(command, "-c")
	command = append(command, "--no-password")

	cmd := exec.Command(command[0], command[1:]...)
	// capture stdout for writer
	outPipe, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("could not get stdout pipe for postgres dump: %v", err)
		return err
	}

	// capture and read stderr in case an error occurs
	errPipe, err := cmd.StderrPipe()
	if err != nil {
		log.Errorf("could not get stderr pipe for postgres dump: %v", err)
		return err
	}
	var buf bytes.Buffer
	go func() {
		defer errPipe.Close()
		if _, err := io.Copy(&buf, errPipe); err != nil {
			log.Errorf("could not read from stderr pipe for postgres dump: %v", err)
		}
	}()

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run postgres dump: %v", err)
		return err
	}

	go func() {
		defer outPipe.Close()
		upload(outPipe)
	}()
	if err := cmd.Wait(); err != nil {
		log.Errorln(strings.TrimRight(buf.String(), "\r\n"))
		return fmt.Errorf("postgres dump: %v", err)
	}
	return nil
}
