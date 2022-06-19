package service

import (
	"context"
	"fmt"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/elasticsearch"
	"github.com/swisscom/backman/service/mongodb"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
)

func (s *Service) Restore(service config.Service, target config.Service, filename string) error {
	envService, err := s.App.Services.WithName(service.Name)
	if err != nil {
		log.Errorf("could not find service [%s] to restore: %v", service.Name, err)
		return err
	}
	if len(target.Name) > 0 {
		envService, err = s.App.Services.WithName(target.Name)
		if err != nil {
			log.Errorf("could not find target service [%s] to restore: %v", target.Name, err)
			return err
		}
	}

	// ctx to abort restore if this takes longer than defined timeout
	ctx, cancel := context.WithTimeout(context.Background(), service.Timeout)
	defer cancel()

	objectPath := fmt.Sprintf("%s/%s/%s", service.Binding.Type, service.Name, filename)
	switch service.Type() {
	case config.MongoDB:
		err = mongodb.Restore(ctx, s.S3, service, envService, objectPath)
	// case util.Redis:
	// 	err = redis.Restore(ctx, s.S3, service, envService, objectPath)
	case config.MySQL:
		err = mysql.Restore(ctx, s.S3, service, envService, objectPath)
	case config.Postgres:
		err = postgres.Restore(ctx, s.S3, service, envService, objectPath)
	case config.Elasticsearch:
		err = elasticsearch.Restore(ctx, s.S3, service, envService, objectPath)
	default:
		err = fmt.Errorf("unsupported service type [%s]", service.Binding.Type)
	}

	if err != nil {
		log.Errorf("could not restore service [%s] to [%s]: %v", service.Name, envService.Name, err)
		return err
	}
	log.Infof("restored service [%s] with backup [%s] to [%s]", service.Name, filename, envService.Name)
	return err
}
