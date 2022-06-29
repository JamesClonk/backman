package state

import (
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/notifications"
	"github.com/swisscom/backman/notifications/events"
)

var (
	// prom metrics for backup success/failure
	backupQueuedState = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "backman_backup_queued",
		Help: "Backups currently in queue per service.",
	}, []string{"type", "name"})
	backupRunningState = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "backman_backup_running",
		Help: "Current running state of backups triggered per service.",
	}, []string{"type", "name"})
	backupRuns = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "backman_backup_total",
		Help: "Total number of backups triggered per service.",
	}, []string{"type", "name"})
	backupFailures = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "backman_backup_failures_total",
		Help: "Total number of backup failures per service.",
	}, []string{"type", "name"})
	backupSuccess = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "backman_backup_success_total",
		Help: "Total number of successful backups per service.",
	}, []string{"type", "name"})
)

func BackupInit(service config.Service) {
	backupQueuedState.WithLabelValues(service.Binding.Type, service.Name).Set(0)
	backupRunningState.WithLabelValues(service.Binding.Type, service.Name).Set(0)

	Tracker().Set(service,
		State{
			Status: "idle",
			At:     time.Now(),
		})
}

func BackupQueue(service config.Service) {
	backupQueuedState.WithLabelValues(service.Binding.Type, service.Name).Inc()
}

func BackupStart(service config.Service, filename string) {
	backupQueuedState.WithLabelValues(service.Binding.Type, service.Name).Dec()
	backupRunningState.WithLabelValues(service.Binding.Type, service.Name).Set(1)
	backupRuns.WithLabelValues(service.Binding.Type, service.Name).Inc()

	Tracker().Set(service,
		State{
			Operation: "backup",
			Status:    "running",
			Filename:  filename,
			At:        time.Now(),
		})
	notifications.Manager().Send(events.BackupStarted, service, filename)
}

func BackupFailure(service config.Service, filename string) {
	backupRunningState.WithLabelValues(service.Binding.Type, service.Name).Set(0)
	backupFailures.WithLabelValues(service.Binding.Type, service.Name).Inc()

	state, _ := Tracker().Get(service)
	Tracker().Set(service,
		State{
			Operation: "backup",
			Status:    "failure",
			Filename:  filename,
			At:        time.Now(),
			Duration:  time.Since(state.At),
		})
	notifications.Manager().Send(events.BackupFailed, service, filename)
}

func BackupSuccess(service config.Service, filename string) {
	backupRunningState.WithLabelValues(service.Binding.Type, service.Name).Set(0)
	backupSuccess.WithLabelValues(service.Binding.Type, service.Name).Inc()

	state, _ := Tracker().Get(service)
	Tracker().Set(service,
		State{
			Operation: "backup",
			Status:    "success",
			Filename:  filename,
			At:        time.Now(),
			Duration:  time.Since(state.At),
		})

	notifications.Manager().Send(events.BackupSuccess, service, filename)
}
