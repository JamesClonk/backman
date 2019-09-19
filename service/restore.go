package service

import (
	"context"
	"fmt"

	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/elasticsearch"
	"github.com/swisscom/backman/service/mongodb"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
	"github.com/swisscom/backman/service/util"
)

func (s *Service) Restore(service util.Service, filename string) error {
	envService, err := s.App.Services.WithName(service.Name)
	if err != nil {
		log.Errorf("could not find service [%s] to restore: %v", service.Name, err)
		return err
	}

	// ctx to abort restore if this takes longer than defined timeout
	ctx, cancel := context.WithTimeout(context.Background(), service.Timeout)
	defer cancel()

	objectPath := fmt.Sprintf("%s/%s/%s", service.Label, service.Name, filename)
	switch service.Type() {
	case util.MongoDB:
		err = mongodb.Restore(ctx, s.S3, service, envService, objectPath)
	case util.MySQL:
		err = mysql.Restore(ctx, s.S3, service, envService, objectPath)
	case util.Postgres:
		err = postgres.Restore(ctx, s.S3, service, envService, objectPath)
	case util.Elasticsearch:
		err = elasticsearch.Restore(ctx, s.S3, service, envService, objectPath)
	default:
		err = fmt.Errorf("unsupported service type [%s]", service.Label)
	}

	if err != nil {
		log.Errorf("could not restore service [%s]: %v", service.Name, err)
		return err
	}
	log.Infof("restored service [%s] with backup [%s]", service.Name, filename)
	return err
}
