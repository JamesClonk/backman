package main

import (
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/router"
)

func main() {
	r := router.New()
	log.Fatalf("%v", r.Start())
}
