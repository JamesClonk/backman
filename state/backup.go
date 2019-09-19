package state

import (
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/swisscom/backman/service/util"
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

func BackupInit(service util.Service) {
	backupQueuedState.WithLabelValues(service.Label, service.Name).Set(0)
	backupRunningState.WithLabelValues(service.Label, service.Name).Set(0)

	Tracker().Set(service.Key(),
		State{
			Status: "idle",
			At:     time.Now(),
		})
}

func BackupQueue(service util.Service) {
	backupQueuedState.WithLabelValues(service.Label, service.Name).Inc()
}

func BackupStart(service util.Service) {
	backupQueuedState.WithLabelValues(service.Label, service.Name).Dec()
	backupRunningState.WithLabelValues(service.Label, service.Name).Set(1)
	backupRuns.WithLabelValues(service.Label, service.Name).Inc()

	Tracker().Set(service.Key(),
		State{
			Type:   "backup",
			Status: "running",
			At:     time.Now(),
		})
}

func BackupFailure(service util.Service) {
	backupRunningState.WithLabelValues(service.Label, service.Name).Set(0)
	backupFailures.WithLabelValues(service.Label, service.Name).Inc()

	state, _ := Tracker().Get(service.Key())
	Tracker().Set(service.Key(),
		State{
			Type:     "backup",
			Status:   "failure",
			At:       time.Now(),
			Duration: time.Since(state.At),
		})
}

func BackupSuccess(service util.Service) {
	backupRunningState.WithLabelValues(service.Label, service.Name).Set(0)
	backupSuccess.WithLabelValues(service.Label, service.Name).Inc()

	state, _ := Tracker().Get(service.Key())
	Tracker().Set(service.Key(),
		State{
			Type:     "backup",
			Status:   "success",
			At:       time.Now(),
			Duration: time.Since(state.At),
		})
}
