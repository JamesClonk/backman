package state

import (
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/swisscom/backman/service/util"
)

var (
	// prom metrics for backup success/failure
	restoreQueuedState = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "backman_restore_queued",
		Help: "Restores currently in queue per service.",
	}, []string{"type", "name"})
	restoreRunningState = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "backman_restore_running",
		Help: "Current running state of restores triggered per service.",
	}, []string{"type", "name"})
	restoreRuns = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "backman_restore_total",
		Help: "Total number of restores triggered per service.",
	}, []string{"type", "name"})
	restoreFailures = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "backman_restore_failures_total",
		Help: "Total number of restore failures per service.",
	}, []string{"type", "name"})
	restoreSuccess = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "backman_restore_success_total",
		Help: "Total number of successful restores per service.",
	}, []string{"type", "name"})
)

func RestoreInit(service util.Service) {
	restoreQueuedState.WithLabelValues(service.Label, service.Name).Set(0)
	restoreRunningState.WithLabelValues(service.Label, service.Name).Set(0)
}

func RestoreQueue(service util.Service) {
	restoreQueuedState.WithLabelValues(service.Label, service.Name).Inc()
}

func RestoreStart(service util.Service) {
	restoreQueuedState.WithLabelValues(service.Label, service.Name).Dec()
	restoreRunningState.WithLabelValues(service.Label, service.Name).Set(1)
	restoreRuns.WithLabelValues(service.Label, service.Name).Inc()

	Tracker().Set(service.Key(),
		State{
			Type:   "restore",
			Status: "running",
			At:     time.Now(),
		})
}

func RestoreFailure(service util.Service) {
	restoreRunningState.WithLabelValues(service.Label, service.Name).Set(0)
	restoreFailures.WithLabelValues(service.Label, service.Name).Inc()

	state, _ := Tracker().Get(service.Key())
	Tracker().Set(service.Key(),
		State{
			Type:     "restore",
			Status:   "failure",
			At:       time.Now(),
			Duration: time.Since(state.At),
		})
}

func RestoreSuccess(service util.Service) {
	restoreRunningState.WithLabelValues(service.Label, service.Name).Set(0)
	restoreSuccess.WithLabelValues(service.Label, service.Name).Inc()

	state, _ := Tracker().Get(service.Key())
	Tracker().Set(service.Key(),
		State{
			Type:     "restore",
			Status:   "success",
			At:       time.Now(),
			Duration: time.Since(state.At),
		})
}
