package service

import (
	"context"
	"fmt"

	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service/mysql"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service/postgres"
)

func (s *Service) Restore(service CFService, filename string) error {
	envService, err := s.App.Services.WithName(service.Name)
	if err != nil {
		log.Errorf("could not find service [%s] to restore: %v", service.Name, err)
		return err
	}

	// ctx to abort restore if this takes longer than defined timeout
	ctx, cancel := context.WithTimeout(context.Background(), service.Timeout)
	defer cancel()

	objectPath := fmt.Sprintf("%s/%s/%s", service.Label, service.Name, filename)
	switch ParseServiceType(service.Label) {
	// case MongoDB:
	// 	err = mongodb.Restore(ctx, s.S3, envService, objectPath)
	case MySQL:
		err = mysql.Restore(ctx, s.S3, envService, objectPath)
	case Postgres:
		err = postgres.Restore(ctx, s.S3, envService, objectPath)
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
