package main

import (
	"github.com/JamesClonk/backman/log"
	"github.com/JamesClonk/backman/router"
	"github.com/JamesClonk/backman/scheduler"
	"github.com/JamesClonk/backman/service"
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
