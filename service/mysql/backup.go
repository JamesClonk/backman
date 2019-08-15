package mysql

import (
	"bytes"
	"io"
	"os"
	"os/exec"
	"strings"

	"github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
)

func Backup(service *cfenv.Service, upload func(io.Reader)) error {
	//host, _ := service.CredentialString("host")
	//port, _ := service.CredentialString("port")
	//database, _ := service.CredentialString("database")
	//username, _ := service.CredentialString("username")
	password, _ := service.CredentialString("password")

	os.Setenv("MYSQL_PWD", password)

	// var db string
	// if len(database) > 0 {
	// 	db = fmt.Sprintf("--databases %s", database)
	// } else {
	// 	db = "--all-databases"
	// }

	//cmd := exec.Command("mysqldump", db, "-h", host, "-P", port, "-u", username)
	cmd := exec.Command("cat", "testfile.dat")
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
		log.Errorf("mysqldump: %v", err)
		return err
	}
	return nil
}
