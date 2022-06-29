package state

import (
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/swisscom/backman/config"
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

func RestoreInit(service config.Service) {
	restoreQueuedState.WithLabelValues(service.Binding.Type, service.Name).Set(0)
	restoreRunningState.WithLabelValues(service.Binding.Type, service.Name).Set(0)
}

func RestoreQueue(service config.Service) {
	restoreQueuedState.WithLabelValues(service.Binding.Type, service.Name).Inc()
}

func RestoreStart(service config.Service, filename string) {
	restoreQueuedState.WithLabelValues(service.Binding.Type, service.Name).Dec()
	restoreRunningState.WithLabelValues(service.Binding.Type, service.Name).Set(1)
	restoreRuns.WithLabelValues(service.Binding.Type, service.Name).Inc()

	Tracker().Set(service,
		State{
			Operation: "restore",
			Status:    "running",
			Filename:  filename,
			At:        time.Now(),
		})
}

func RestoreFailure(service config.Service, filename string) {
	restoreRunningState.WithLabelValues(service.Binding.Type, service.Name).Set(0)
	restoreFailures.WithLabelValues(service.Binding.Type, service.Name).Inc()

	state, _ := Tracker().Get(service)
	Tracker().Set(service,
		State{
			Operation: "restore",
			Status:    "failure",
			Filename:  filename,
			At:        time.Now(),
			Duration:  time.Since(state.At),
		})
}

func RestoreSuccess(service config.Service, filename string) {
	restoreRunningState.WithLabelValues(service.Binding.Type, service.Name).Set(0)
	restoreSuccess.WithLabelValues(service.Binding.Type, service.Name).Inc()

	state, _ := Tracker().Get(service)
	Tracker().Set(service,
		State{
			Operation: "restore",
			Status:    "success",
			Filename:  filename,
			At:        time.Now(),
			Duration:  time.Since(state.At),
		})
}
