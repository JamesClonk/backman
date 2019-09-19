package main

import (
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/router"
	"github.com/swisscom/backman/scheduler"
	"github.com/swisscom/backman/service"
)

//go:generate swagger generate spec
func main() {
	// init services
	service.Get()

	// schedule backups
	scheduler.RegisterBackups()

	// serve API & UI
	r := router.New()
	log.Fatalf("%v", r.Start())
}
