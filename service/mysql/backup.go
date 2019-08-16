package mysql

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
)

var mysqlMutex = &sync.Mutex{}

func Backup(service *cfenv.Service) (io.Reader, error) {
	// lock global mysql mutex, only 1 backup of this service-type is allowed to run in parallel
	mysqlMutex.Lock()
	defer mysqlMutex.Unlock()

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
	command = append(command, "--single-transaction")
	command = append(command, "--quick")
	command = append(command, "-h")
	command = append(command, host)
	command = append(command, "-P")
	command = append(command, port)
	command = append(command, "-u")
	command = append(command, username)

	log.Debugf("executing mysql backup command: %v", strings.Join(command, " "))
	cmd := exec.Command(command[0], command[1:]...)

	// capture stdout to pass to gzipping buffer
	outPipe, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("could not get stdout pipe for mysqldump: %v", err)
		return nil, err
	}

	// capture and read stderr in case an error occurs
	var errBuf bytes.Buffer
	cmd.Stderr = &errBuf

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run mysqldump: %v", err)
		return nil, err
	}

	// gzipping stdout
	var outBuf bytes.Buffer
	gw := gzip.NewWriter(&outBuf)
	//gw.Name = filename
	gw.ModTime = time.Now()
	defer outPipe.Close()
	defer gw.Close()
	_, _ = io.Copy(gw, bufio.NewReader(outPipe))

	if err := cmd.Wait(); err != nil {
		log.Errorln(strings.TrimRight(errBuf.String(), "\r\n"))
		return nil, fmt.Errorf("mysqldump: %v", err)
	}
	return &outBuf, nil
}
