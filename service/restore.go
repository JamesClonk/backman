package service

import (
	"context"
	"fmt"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/elasticsearch"
	"github.com/swisscom/backman/service/mongodb"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
)

var (
	// prom metrics for backup success/failure
	restoreRuns = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "backman_restores_total",
		Help: "Total number of restores triggered per service.",
	}, []string{"service_name", "service_type"})
	restoreFailures = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "backman_restore_failures_total",
		Help: "Total number of restore failures per service.",
	}, []string{"service_name", "service_type"})
	restoreSuccess = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "backman_restore_success_total",
		Help: "Total number of successful restores per service.",
	}, []string{"service_name", "service_type"})
)

func (s *Service) Restore(service CFService, filename string) error {
	envService, err := s.App.Services.WithName(service.Name)
	if err != nil {
		log.Errorf("could not find service [%s] to restore: %v", service.Name, err)
		return err
	}
	restoreRuns.WithLabelValues(service.Name, service.Type().String()).Inc()

	// ctx to abort restore if this takes longer than defined timeout
	ctx, cancel := context.WithTimeout(context.Background(), service.Timeout)
	defer cancel()

	objectPath := fmt.Sprintf("%s/%s/%s", service.Label, service.Name, filename)
	switch service.Type() {
	case MongoDB:
		err = mongodb.Restore(ctx, s.S3, envService, objectPath)
	case MySQL:
		err = mysql.Restore(ctx, s.S3, envService, objectPath)
	case Postgres:
		err = postgres.Restore(ctx, s.S3, envService, objectPath)
	case Elasticsearch:
		err = elasticsearch.Restore(ctx, s.S3, envService, objectPath)
	default:
		err = fmt.Errorf("unsupported service type [%s]", service.Label)
	}

	if err != nil {
		log.Errorf("could not restore service [%s]: %v", service.Name, err)
		restoreFailures.WithLabelValues(service.Name, service.Type().String()).Inc()
		return err
	}
	log.Infof("restored service [%s] with backup [%s]", service.Name, filename)
	restoreSuccess.WithLabelValues(service.Name, service.Type().String()).Inc()
	return err
}
