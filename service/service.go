package service

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
	"github.com/swisscom/backman/service/redis"
	"github.com/swisscom/backman/state"
)

func init() {
	rand.Seed(time.Now().UTC().UnixNano())
}

func ParseVCAPServices() ([]config.Service, error) {
	app, err := cfenv.Current()
	if err != nil {
		return nil, fmt.Errorf("could not parse VCAP_*: %v", err)
	}

	services := make([]config.Service, 0)
	for _, vcapServices := range app.Services {
		for _, vcapService := range vcapServices {
			// exclude S3 storage service, don't try to parse it as a service for backups
			if vcapService.Name == config.Get().S3.ServiceName ||
				(vcapService.Label == config.Get().S3.ServiceLabel && vcapService.Label != "user-provided") {
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

			// TODO: below stuff should move to the config method that calls this here to merge vcap services...
			// read timeout for service
			timeout := config.Get().Services[vcapService.Name].Timeout
			if timeout.Seconds() <= 1 {
				timeout.Duration = 1 * time.Hour // default
			}

			// TODO: below stuff should move to the config method that calls this here to merge vcap services...
			// read crontab schedule for service
			schedule := config.Get().Services[vcapService.Name].Schedule
			if len(schedule) == 0 {
				// create a random schedule for daily backup as a fallback
				schedule = fmt.Sprintf("%d %d %d * * *", rand.Intn(59), rand.Intn(59), rand.Intn(23))
			}

			// TODO: below stuff should move to the config method that calls this here to merge vcap services...
			// read retention days & files, with defaults as fallback
			retentionDays := config.Get().Services[vcapService.Name].Retention.Days
			retentionFiles := config.Get().Services[vcapService.Name].Retention.Files
			if retentionDays <= 0 {
				retentionDays = 31 // default
			}
			if retentionFiles <= 0 {
				retentionFiles = 100 // default
			}

			// build service-binding out of VCAP_SERVICES
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
				// TODO: below stuff is not needed anymore? the config method that calls this here to merge vcap services already has these properties...
				Timeout:  timeout,
				Schedule: schedule,
				Retention: config.ServiceRetention{
					Days:  retentionDays,
					Files: retentionFiles,
				},
				// TODO: below stuff is not needed anymore? the config method that calls this here to merge vcap services already has these properties...
				DirectS3:                config.Get().Services[vcapService.Name].DirectS3,
				DisableColumnStatistics: config.Get().Services[vcapService.Name].DisableColumnStatistics,
				LogStdErr:               config.Get().Services[vcapService.Name].LogStdErr,
				ForceImport:             config.Get().Services[vcapService.Name].ForceImport,
				LocalBackupPath:         config.Get().Services[vcapService.Name].LocalBackupPath,
				IgnoreTables:            config.Get().Services[vcapService.Name].IgnoreTables,
				BackupOptions:           config.Get().Services[vcapService.Name].BackupOptions,
				RestoreOptions:          config.Get().Services[vcapService.Name].RestoreOptions,
			}
			services = append(services, newService)
		}
	}

	// setup service metrics
	for _, service := range services {
		// init prometheus state metrics to 0
		state.BackupInit(service)
		state.RestoreInit(service)

		// init backup files state & metrics in background
		go func(serviceType, name string) {
			_, _ = GetBackups(serviceType, name)
		}(service.Binding.Type, service.Name)
	}

	log.Debugf("services loaded: %+v", config.Get().Services) // TODO: this needs to move to config.Services-Loader-Method that calls ParseVCAPServices?!
	return services, nil
}

func GetServices(serviceType, serviceName string) []config.Service {
	services := make([]config.Service, 0)
	if len(serviceName) > 0 {
		// list only a specific service binding
		for _, service := range config.Get().Services {
			if service.Name == serviceName {
				services = append(services, service)
				break
			}
		}

	} else if len(serviceType) > 0 {
		// list services only for a specific service type
		for _, service := range config.Get().Services {
			if service.Binding.Type == serviceType {
				services = append(services, service)
			}
		}

	} else {
		// list all services
		services := make([]config.Service, 0)
		for _, service := range config.Get().Services {
			services = append(services, service)
		}
		return services
	}
	return services
}

func GetService(serviceType, serviceName string) config.Service {
	for _, service := range config.Get().Services {
		if service.Name == serviceName && service.Binding.Type == serviceType {
			return service
		}
	}
	return config.Service{}
}
