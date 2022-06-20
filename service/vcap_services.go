package service

import (
	"fmt"
	"strconv"

	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
	"github.com/swisscom/backman/service/redis"
)

func mergeVCAPServices() {
	vcapServices, err := parseVCAPServices()
	if err != nil {
		// for user convenience only log as error if no services have been configured already
		if len(config.Get().Services) > 0 {
			log.Debugf("could not read VCAP_SERVICES: %v", err)
		} else {
			log.Errorf("could not read VCAP_SERVICES: %v", err)
		}
	}

	for _, vcapService := range vcapServices {
		if service, found := config.Get().Services[vcapService.Name]; found {
			// only merge service binding if service already exists in config.Services
			service.Binding = vcapService.Binding
			config.Get().Services[service.Name] = service
		} else {
			// otherwise insert entire service into config.Services
			config.Get().Services[vcapService.Name] = vcapService
		}
	}

	config.ValidateServices() // ensure services are still configured correctly after we merged into them
}

func parseVCAPServices() ([]config.Service, error) {
	app, err := cfenv.Current()
	if err != nil {
		return nil, fmt.Errorf("could not parse VCAP_*: %v", err)
	}

	services := make([]config.Service, 0)
	for _, vcapServices := range app.Services {
		for _, vcapService := range vcapServices {
			// exclude S3 storage service, don't try to parse it as a service for backups
			if vcapService.Name == config.Get().S3.ServiceName ||
				(vcapService.Label == config.Get().S3.ServiceLabel && vcapService.Label != "user-provided") ||
				vcapService.Label == "s3" ||
				vcapService.Label == "dynstrg" ||
				vcapService.Label == "dynstrg-2" ||
				vcapService.Label == "dynstrg-3" ||
				vcapService.Label == "minio" {
				continue
			}

			// if it is an unrecognized type/label or user-provided service
			// then try to figure out if it can be identified as a supported service type
			if !config.IsValidServiceType(vcapService.Label) || vcapService.Label == "user-provided" {
				// can it be identified as a custom postgres binding?
				if postgres.IsVCAPPostgresBinding(&vcapService) {
					vcapService.Label = "postgres"
				} else if mysql.IsVCAPMySQLBinding(&vcapService) { // or a mysql binding?
					vcapService.Label = "mysql"
				} else if redis.IsVCAPRedisBinding(&vcapService) { // or a redis binding?
					vcapService.Label = "redis"
				} else {
					log.Errorf("unsupported service type [%s]: could not identify [%s]", vcapService.Label, vcapService.Name)
					continue // cannot handle this service binding
				}
			}

			// build service binding out of VCAP_SERVICES
			binding := config.ServiceBinding{
				Type: vcapService.Label,
				Plan: vcapService.Plan,
			}
			switch config.ParseServiceType(vcapService.Label) {
			case config.Elasticsearch:
				username, _ := vcapService.CredentialString("full_access_username")
				password, _ := vcapService.CredentialString("full_access_password")
				if len(username) == 0 {
					username, _ = vcapService.CredentialString("username")
				}
				if len(password) == 0 {
					password, _ = vcapService.CredentialString("password")
				}
				binding.Username = username
				binding.Password = password
				binding.Host, _ = vcapService.CredentialString("host")
				binding.URI, _ = vcapService.CredentialString("uri")
				if len(binding.Host) == 0 {
					binding.Host = binding.URI
				}

			case config.MongoDB:
				port, _ := vcapService.CredentialString("port")
				portnum, _ := strconv.Atoi(port)
				binding.Port = portnum
				binding.Host, _ = vcapService.CredentialString("host")
				binding.URI, _ = vcapService.CredentialString("uri")
				binding.Username, _ = vcapService.CredentialString("username")
				binding.Password, _ = vcapService.CredentialString("password")
				binding.Database, _ = vcapService.CredentialString("database")

			case config.MySQL:
				credentials := mysql.GetVCAPCredentials(&vcapService)
				binding.Host = credentials.Hostname
				binding.Port = credentials.Port
				binding.URI, _ = vcapService.CredentialString("uri")
				binding.Username = credentials.Username
				binding.Password = credentials.Password
				binding.Database = credentials.Database

			case config.Postgres:
				credentials := mysql.GetVCAPCredentials(&vcapService)
				binding.Host = credentials.Hostname
				binding.Port = credentials.Port
				binding.URI, _ = vcapService.CredentialString("uri")
				binding.Username = credentials.Username
				binding.Password = credentials.Password
				binding.Database = credentials.Database

			case config.Redis:
				credentials := redis.GetVCAPCredentials(&vcapService)
				binding.Host = credentials.Hostname
				binding.Port = credentials.Port
				binding.URI, _ = vcapService.CredentialString("uri")
				binding.Password = credentials.Password
			}

			newService := config.Service{
				Name:    vcapService.Name,
				Binding: binding,
			}
			services = append(services, newService)
		}
	}
	return services, nil
}
