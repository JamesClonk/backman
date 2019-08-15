package mysql

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

	os.Setenv("MYSQL_PWD", password)

	// prepare mysqldump command
	var command []string
	command = append(command, "mysqldump")
	if len(database) > 0 {
		command = append(command, "--databases")
		command = append(command, database)
	} else {
		command = append(command, "--all-databases")
	}
	command = append(command, "-h")
	command = append(command, host)
	command = append(command, "P")
	command = append(command, port)
	command = append(command, "-u")
	command = append(command, username)

	cmd := exec.Command(command[0], command[1:]...)
	// capture stdout for writer
	outPipe, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("could not get stdout pipe for mysqldump: %v", err)
		return err
	}

	// capture and read stderr in case an error occurs
	errPipe, err := cmd.StderrPipe()
	if err != nil {
		log.Errorf("could not get stderr pipe for mysqldump: %v", err)
		return err
	}
	var buf bytes.Buffer
	go func() {
		defer errPipe.Close()
		if _, err := io.Copy(&buf, errPipe); err != nil {
			log.Errorf("could not read from stderr pipe for mysqldump: %v", err)
		}
	}()

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run mysqldump: %v", err)
		return err
	}

	go func() {
		upload(outPipe)
	}()
	if err := cmd.Wait(); err != nil {
		log.Errorln(strings.TrimRight(buf.String(), "\r\n"))
		return fmt.Errorf("mysqldump: %v", err)
	}
	return nil
}
