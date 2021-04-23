package service

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
	"github.com/swisscom/backman/service/redis"
	"github.com/swisscom/backman/service/util"
	"github.com/swisscom/backman/state"
)

var (
	service *Service
	once    sync.Once
)

// Service is used interact with services and dump/restore backups
type Service struct {
	App      *cfenv.App
	S3       *s3.Client
	Services []util.Service
}

func init() {
	rand.Seed(time.Now().UTC().UnixNano())
}

func new(app *cfenv.App, s3 *s3.Client) *Service {
	return &Service{
		App: app,
		S3:  s3,
	}
}

func Get() *Service {
	once.Do(func() {
		app, err := cfenv.Current()
		if err != nil {
			log.Fatalf("%v", err)
		}
		s3 := s3.New(app)

		service = new(app, s3)
		service.parseServices()
	})
	return service
}

func (s *Service) parseServices() {
	s.Services = make([]util.Service, 0)

	for _, services := range s.App.Services {
		for _, service := range services {
			// exclude S3 storage service, don't try to parse it as a service for backups
			if service.Name == config.Get().S3.ServiceName ||
				(service.Label == config.Get().S3.ServiceLabel && service.Label != "user-provided") {
				continue
			}

			// if it is an unrecognized type/label or user-provided service
			// then try to figure out if it can be identified as a supported service type
			if !util.IsValidServiceType(service.Label) || service.Label == "user-provided" {
				// can it be identified as a custom postgres binding?
				if postgres.IsPostgresBinding(&service) {
					service.Label = "postgres"
				} else if mysql.IsMySQLBinding(&service) { // or a mysql binding?
					service.Label = "mysql"
				} else if redis.IsRedisBinding(&service) { // or a redis binding?
					service.Label = "redis"
				} else {
					// try to guess it via service tags as a last resort
					var identified bool
					for _, tag := range service.Tags {
						if util.IsValidServiceType(tag) {
							identified = true
							service.Label = tag
							break
						}
					}
					if !identified {
						log.Errorf("unsupported service type [%s]: could not identify [%s]", service.Label, service.Name)
						continue // cannot handle this service binding
					}
				}
			}

			// read timeout for service
			timeout := config.Get().Services[service.Name].Timeout
			if timeout.Seconds() <= 1 {
				timeout.Duration = 1 * time.Hour // default
			}

			// read crontab schedule for service
			schedule := config.Get().Services[service.Name].Schedule
			if len(schedule) == 0 {
				// create a random schedule for daily backup as a fallback
				schedule = fmt.Sprintf("%d %d %d * * *", rand.Intn(59), rand.Intn(59), rand.Intn(23))
			}

			// read retention days & files, with defaults as fallback
			retentionDays := config.Get().Services[service.Name].Retention.Days
			retentionFiles := config.Get().Services[service.Name].Retention.Files
			if retentionDays <= 0 {
				retentionDays = 31 // default
			}
			if retentionFiles <= 0 {
				retentionFiles = 100 // default
			}

			newService := util.Service{
				Name:     service.Name,
				Label:    service.Label,
				Plan:     service.Plan,
				Tags:     service.Tags,
				Timeout:  timeout.Duration,
				Schedule: schedule,
				Retention: util.Retention{
					Days:  retentionDays,
					Files: retentionFiles,
				},
				DirectS3:                config.Get().Services[service.Name].DirectS3,
				DisableColumnStatistics: config.Get().Services[service.Name].DisableColumnStatistics,
				ForceImport:             config.Get().Services[service.Name].ForceImport,
				LocalBackupPath:         config.Get().Services[service.Name].LocalBackupPath,
				BackupOptions:           config.Get().Services[service.Name].BackupOptions,
				RestoreOptions:          config.Get().Services[service.Name].RestoreOptions,
			}
			s.Services = append(s.Services, newService)
		}
	}

	// setup service metrics
	for _, service := range s.Services {
		// init prometheus state metrics to 0
		state.BackupInit(service)
		state.RestoreInit(service)

		// init backup files state & metrics in background
		go func(label, name string) {
			_, _ = s.GetBackups(label, name)
		}(service.Label, service.Name)
	}

	log.Debugf("services loaded: %+v", s.Services)
}

func (s *Service) GetServices(serviceType, serviceName string) []util.Service {
	services := make([]util.Service, 0)
	if len(serviceName) > 0 {
		// list only a specific service binding
		for _, service := range s.Services {
			if service.Name == serviceName {
				services = append(services, service)
				break
			}
		}

	} else if len(serviceType) > 0 {
		// list services only for a specific service type
		for _, service := range s.Services {
			if service.Label == serviceType {
				services = append(services, service)
			}
		}

	} else {
		// list all services
		return s.Services
	}
	return services
}

func (s *Service) GetService(serviceType, serviceName string) util.Service {
	for _, service := range s.Services {
		if service.Name == serviceName && service.Label == serviceType {
			return service
		}
	}
	return util.Service{}
}
