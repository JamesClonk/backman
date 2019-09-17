package scheduler

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/robfig/cron"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service"
)

var (
	c = cron.New()

	// prom metrics for scheduled backup success/failure
	scheduledRuns = promauto.NewCounter(prometheus.CounterOpts{
		Name: "scheduler_runs_total",
		Help: "Total number of backup runs triggered over crontab-schedule.",
	})
	scheduledFailures = promauto.NewCounter(prometheus.CounterOpts{
		Name: "scheduler_backup_failures_total",
		Help: "Total number of backup failures over crontab-schedule.",
	})
	scheduledSuccess = promauto.NewCounter(prometheus.CounterOpts{
		Name: "scheduler_backup_success_total",
		Help: "Total number of successful backups over crontab-schedule.",
	})
)

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
	scheduledRuns.Inc()

	if err := service.Get().Backup(s); err != nil {
		log.Errorf("scheduled backup for service [%s] failed: %v", s.Name, err)
		scheduledFailures.Inc()
	} else {
		scheduledSuccess.Inc()
	}
}
