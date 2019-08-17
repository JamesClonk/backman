package scheduler

import (
	"fmt"
	"time"

	"github.com/robfig/cron"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service"
)

var c = cron.New()

func StartScheduler() {
	c.Start()
}

func StopScheduler() {
	c.Stop()
}

func RegisterBackups() {
	log.Infoln("registering service backups in scheduler")

	for _, s := range service.Get().Services {
		sCopy := s
		fn := func() { Run(sCopy) }
		c.AddFunc(s.Schedule, fn)
		log.Infof("service backup for [%s/%s] with schedule [%s] registered", s.Label, s.Name, s.Schedule)
	}
	StartScheduler()
}

func Run(s service.CFService) {
	log.Infof("running backup for service [%s]", s.Name)

	filename := fmt.Sprintf("%s-%s.gz", s.Name, time.Now().Format("20060102150405"))
	if err := service.Get().Backup(s, filename); err != nil {
		log.Errorf("scheduled backup for service [%s] failed: %v", s.Name, err)
	}
}
