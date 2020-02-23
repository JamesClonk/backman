package main

import (
	"flag"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/router"
	"github.com/swisscom/backman/scheduler"
	"github.com/swisscom/backman/service"
)

//go:generate swagger generate spec
func main() {
	log.Infoln("starting up backman ...")

	// init services
	service.Get()

	// check if an immediate backup should run / non-background mode
	if runBackupNow() {
		return
	}

	// schedule backups
	scheduler.RegisterBackups()

	// serve API & UI
	r := router.New()
	log.Fatalf("%v", r.Start())
}

func runBackupNow() bool {
	serviceToBackup := flag.String("backup", "", "service to backup now")
	flag.Parse()

	if len(*serviceToBackup) > 0 {
		log.Infof("backup flag provided with value [%s], running backup now", *serviceToBackup)

		// setting config to non-background mode, to avoid background goroutines during backups
		config.Get().Foreground = true

		// find service to backup
		var found bool
		for _, s := range service.Get().Services {
			if s.Name == *serviceToBackup {
				// running backup
				log.Infof("running service backup for [%s/%s]", s.Label, s.Name)
				if err := service.Get().Backup(s); err != nil {
					log.Fatalf("service backup failed: %v", err)
				}
				found = true

				// running S3 cleanup
				if err := service.Get().RetentionCleanup(s); err != nil {
					log.Errorf("could not cleanup S3 storage for service [%s]: %v", s.Name, err)
				}
				break
			}
		}
		if !found {
			log.Fatalf("could not find any service named [%s]", *serviceToBackup)
		}

		log.Infoln("backup successfully completed")
		return true
	}
	return false
}
