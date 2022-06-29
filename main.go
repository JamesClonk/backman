package main

import (
	"flag"
	"time"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/notifications"
	"github.com/swisscom/backman/router"
	"github.com/swisscom/backman/scheduler"
	"github.com/swisscom/backman/service"
)

var (
	configFile        string
	serviceToBackup   string
	serviceToRestore  string
	filenameToRestore string
)

func init() {
	flag.StringVar(&configFile, "config", "config.json", "configuration file for backman")
	flag.StringVar(&serviceToBackup, "backup", "", "service to backup now")
	flag.StringVar(&serviceToRestore, "restore", "", "service to restore now")
	flag.StringVar(&filenameToRestore, "filename", "", "filename to use for service restore")
	flag.Parse()

	// specify config file to load
	if len(configFile) > 0 {
		config.SetConfigFile(configFile)
	}
	// initialize config
	config.Init()

	// setup logger
	log.Init()

	// setup service instances
	service.Init()

	// init notifications manager
	notifications.Init()
}

//go:generate swagger generate spec
func main() {
	time.Sleep(1 * time.Second) // wait for init
	log.Infoln("starting up backman ...")

	// check if an immediate backup/restore should run, in non-background mode. otherwise continue and start scheduler
	if runNow() {
		return
	}

	// schedule backups
	scheduler.RegisterBackups()

	// serve API & UI
	r := router.New()
	log.Fatalf("failed to start HTTP router: %v", r.Start())
}

func runNow() bool {
	// check if backup should run
	if len(serviceToBackup) > 0 {
		log.Infof("backup flag provided with value [%s], running backup now", serviceToBackup)

		// setting config to non-background mode, to avoid background goroutines during backups
		config.Get().Foreground = true

		// find service to backup
		var found bool
		for _, s := range config.Get().Services {
			if s.Name == serviceToBackup {
				// running backup
				log.Infof("running service backup for [%s/%s]", s.Binding.Type, s.Name)
				if err := service.CreateBackup(s); err != nil {
					log.Fatalf("service backup failed: %v", err)
				}
				found = true

				// running S3 cleanup
				if err := service.RetentionCleanup(s); err != nil {
					log.Errorf("could not cleanup S3 storage for service [%s]: %v", s.Name, err)
				}
				break
			}
		}
		if !found {
			log.Fatalf("could not find any service named [%s]", serviceToBackup)
		}

		log.Infoln("backup successfully completed")
		return true
	}

	// check if restore should run
	if len(serviceToRestore) > 0 && len(filenameToRestore) > 0 {
		log.Infof("restore flags provided with values [%s/%s], running restore now", serviceToRestore, filenameToRestore)

		// find service to restore
		var found bool
		for _, s := range config.Get().Services {
			if s.Name == serviceToRestore {
				// running restore
				log.Infof("running service restore for [%s/%s] with filename [%s]", s.Binding.Type, s.Name, filenameToRestore)
				if err := service.RestoreBackup(s, config.Service{}, filenameToRestore); err != nil {
					log.Fatalf("service restore failed: %v", err)
				}
				found = true
				break
			}
		}
		if !found {
			log.Fatalf("could not find any service named [%s]", serviceToRestore)
		}

		log.Infoln("restore successfully completed")
		return true
	}

	return false
}
