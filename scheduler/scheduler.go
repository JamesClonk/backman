package scheduler

import (
	"github.com/JamesClonk/backman/log"
	"github.com/JamesClonk/backman/service"
	"github.com/robfig/cron"
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
		if err := c.AddFunc(s.Schedule, fn); err != nil {
			log.Fatalf("could not register service backup [%s] in scheduler: %v", s.Name, err)
		}
		log.Infof("service backup for [%s/%s] with schedule [%s] and timeout [%s] registered", s.Label, s.Name, s.Schedule, s.Timeout)
	}
	StartScheduler()
}

func Run(s service.CFService) {
	log.Infof("running backup for service [%s]", s.Name)
	if err := service.Get().Backup(s); err != nil {
		log.Errorf("scheduled backup for service [%s] failed: %v", s.Name, err)
	}
}
