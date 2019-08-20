package service

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/config"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/s3"
)

var (
	service *Service
	once    sync.Once
)

// Service is used interact with services and dump/restore backups
type Service struct {
	App      *cfenv.App
	S3       *s3.Client
	Services []CFService
}
type CFService struct {
	Name      string
	Label     string
	Plan      string
	Tags      []string
	Timeout   time.Duration
	Schedule  string
	Retention Retention
}
type Retention struct {
	Days  int
	Files int
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
	s.Services = make([]CFService, 0)

	for label, services := range s.App.Services {
		if IsValidServiceType(label) {
			for _, service := range services {
				// read timeout for service
				timeout := config.Get().Backup.Timeouts[service.Name]
				if timeout.Seconds() <= 1 {
					timeout = 1 * time.Hour // default
				}

				// read crontab schedule for service
				schedule := config.Get().Backup.Schedules[service.Name]
				if len(schedule) == 0 {
					// create a random schedule for daily backup as a fallback
					schedule = fmt.Sprintf("%d %d %d * * *", rand.Intn(59), rand.Intn(59), rand.Intn(23))
				}

				// read retention days & files, with defaults as fallback
				retentionDays := config.Get().Backup.Retention.Days[service.Name]
				retentionFiles := config.Get().Backup.Retention.Files[service.Name]
				if retentionDays <= 0 {
					retentionDays = 31
				}
				if retentionFiles <= 0 {
					retentionFiles = 100
				}

				s.Services = append(s.Services, CFService{
					Name:     service.Name,
					Label:    service.Label,
					Plan:     service.Plan,
					Tags:     service.Tags,
					Timeout:  timeout,
					Schedule: schedule,
					Retention: Retention{
						Days:  retentionDays,
						Files: retentionFiles,
					},
				})
			}
		}
	}
	log.Debugf("services loaded: %+v", s.Services)
}

func (s *Service) GetServices(serviceType, serviceName string) []CFService {
	cfServices := make([]CFService, 0)
	if len(serviceName) > 0 {
		// list only a specific service binding
		for _, service := range s.Services {
			if service.Name == serviceName {
				cfServices = append(cfServices, service)
				break
			}
		}

	} else if len(serviceType) > 0 {
		// list services only for a specific service type
		for _, service := range s.Services {
			if service.Label == serviceType {
				cfServices = append(cfServices, service)
			}
		}

	} else {
		// list all services
		return s.Services
	}
	return cfServices
}

func (s *Service) GetService(serviceType, serviceName string) CFService {
	for _, service := range s.Services {
		if service.Name == serviceName && service.Label == serviceType {
			return service
		}
	}
	return CFService{}
}
