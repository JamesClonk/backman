package postgres

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

var pgMutex = &sync.Mutex{}

func Backup(service *cfenv.Service) (io.Reader, error) {
	// lock global postgres mutex, only 1 backup of this service-type is allowed to run in parallel
	pgMutex.Lock()
	defer pgMutex.Unlock()

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

	log.Debugf("executing postgres backup command: %v", strings.Join(command, " "))
	cmd := exec.Command(command[0], command[1:]...)

	// capture stdout to pass to gzipping buffer
	outPipe, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("could not get stdout pipe for postgres dump: %v", err)
		return nil, err
	}

	// capture and read stderr in case an error occurs
	var errBuf bytes.Buffer
	cmd.Stderr = &errBuf

	if err := cmd.Start(); err != nil {
		log.Errorf("could not run postgres dump: %v", err)
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
		return nil, fmt.Errorf("postgres dump: %v", err)
	}
	return &outBuf, nil
}
