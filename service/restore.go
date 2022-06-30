package service

import (
	"context"
	"fmt"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/service/elasticsearch"
	"github.com/swisscom/backman/service/mongodb"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
)

func RestoreBackup(service config.Service, target config.Service, filename string) error {
	// ctx to abort restore if this takes longer than defined timeout
	ctx, cancel := context.WithTimeout(context.Background(), service.Timeout.Duration)
	defer cancel()

	objectPath := fmt.Sprintf("%s/%s/%s", service.Binding.Type, service.Name, filename)

	var err error
	switch service.Type() {
	case config.MongoDB:
		err = mongodb.Restore(ctx, s3.Get(), service, target, objectPath)
	// case util.Redis:
	// 	err = redis.Restore(ctx, s3.Get(), service, target, objectPath)
	case config.MySQL:
		err = mysql.Restore(ctx, s3.Get(), service, target, objectPath)
	case config.Postgres:
		err = postgres.Restore(ctx, s3.Get(), service, target, objectPath)
	case config.Elasticsearch:
		err = elasticsearch.Restore(ctx, s3.Get(), service, target, objectPath)
	default:
		err = fmt.Errorf("unsupported service type [%s]", service.Binding.Type)
	}

	if err != nil {
		log.Errorf("could not restore service [%s] to [%s]: %v", service.Name, target.Name, err)
		return err
	}
	log.Infof("restored service [%s] with backup [%s] to [%s]", service.Name, filename, target.Name)
	return err
}
