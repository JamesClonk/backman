package main

import (
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/router"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/scheduler"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service"
)

func main() {
	// init services
	service.Get()

	// schedule backups
	scheduler.RegisterBackups()

	// serve API & UI
	r := router.New()
	log.Fatalf("%v", r.Start())
}
