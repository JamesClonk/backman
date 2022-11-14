package service

import (
	"fmt"
	"os"
	"strconv"

	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/mongodb"
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
			config.Get().Services[vcapService.Name] = service
		} else {
			// otherwise insert entire service into config.Services
			config.Get().Services[vcapService.Name] = vcapService
		}
	}
}

func parseVCAPServices() ([]config.Service, error) {
	// avoid errors in case we are not within a Cloud Foundry container
	if len(os.Getenv("VCAP_SERVICES")) == 0 {
		os.Setenv("VCAP_SERVICES", "{}")
	}
	if len(os.Getenv("VCAP_APPLICATION")) == 0 {
		os.Setenv("VCAP_APPLICATION", "{}")
	}

	// read VCAP_SERVICES environment variable and go through all services in there
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
				// but we will save its credentials into config.S3.* if not already present

				// this check here is necessary since there could be multiple possible S3 services in VCAP_SERVICES
				if len(config.Get().S3.ServiceName) > 0 && vcapService.Name != config.Get().S3.ServiceName {
					continue // this does not seem to be the specific S3 service the user wants to use for storing backups
				}

				if len(config.Get().S3.BucketName) == 0 { // fallback to service binding's name
					config.Get().S3.BucketName = vcapService.Name
				}
				if len(config.Get().S3.Host) == 0 {
					config.Get().S3.Host, _ = vcapService.CredentialString("accessHost")
				}
				if len(config.Get().S3.Host) == 0 {
					config.Get().S3.Host, _ = vcapService.CredentialString("host")
				}
				if len(config.Get().S3.AccessKey) == 0 {
					config.Get().S3.AccessKey, _ = vcapService.CredentialString("accessKey")
				}
				if len(config.Get().S3.AccessKey) == 0 {
					config.Get().S3.AccessKey, _ = vcapService.CredentialString("access_Key")
				}
				if len(config.Get().S3.SecretKey) == 0 {
					config.Get().S3.SecretKey, _ = vcapService.CredentialString("sharedSecret")
				}
				if len(config.Get().S3.SecretKey) == 0 {
					config.Get().S3.SecretKey, _ = vcapService.CredentialString("secret_key")
				}
				continue
			}

			// if it is an unrecognized type/label or user-provided service
			// then try to figure out if it can be identified as a supported service type
			if !config.IsValidServiceType(vcapService.Label) || vcapService.Label == "user-provided" {
				// can it be identified as a custom postgres binding?
				if postgres.IsVCAPBinding(&vcapService) {
					vcapService.Label = "postgres"
				} else if mysql.IsVCAPBinding(&vcapService) { // or a mysql binding?
					vcapService.Label = "mysql"
				} else if mongodb.IsVCAPBinding(&vcapService) { // or a mongodb binding?
					vcapService.Label = "mongodb"
				} else if redis.IsVCAPBinding(&vcapService) { // or a redis binding?
					vcapService.Label = "redis"
				} else {
					// try to guess it via service tags as a last resort
					var identified bool
					for _, tag := range vcapService.Tags {
						if config.IsValidServiceType(tag) {
							identified = true
							vcapService.Label = tag
							break
						}
					}
					if !identified {
						log.Errorf("unsupported service type [%s]: could not identify [%s]", vcapService.Label, vcapService.Name)
						continue // cannot handle this service binding
					}
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
				if len(binding.URI) == 0 {
					binding.URI = binding.Host
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
				credentials := postgres.GetVCAPCredentials(&vcapService)
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
