package service

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/env"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/s3"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/util"
)

var (
	service *Service
	once    sync.Once
)

// Service is used interact with services and dump/restore backups
type Service struct {
	App      *cfenv.App
	S3       *s3.Client
	InMemory bool
	Services []CFService
}
type CFService struct {
	Name      string
	Label     string
	Plan      string
	Tags      []string
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

func new(app *cfenv.App, s3 *s3.Client, inMemory bool) *Service {
	return &Service{
		App:      app,
		S3:       s3,
		InMemory: inMemory,
	}
}

func Get() *Service {
	once.Do(func() {
		app, err := cfenv.Current()
		if err != nil {
			log.Fatalf("%v", err)
		}
		s3 := s3.New(app)

		service = new(
			app, s3,
			env.Get("IN_MEMORY_BACKUPS", "false") == "true",
		)
		service.parseServices()
	})
	return service
}

func (s *Service) parseServices() {
	s.Services = make([]CFService, 0)

	for label, services := range s.App.Services {
		if util.IsValidServiceType(label) {
			for _, service := range services {
				// create a random schedule for daily backup
				randomSchedule := fmt.Sprintf("%d %d %d * * *", rand.Intn(59), rand.Intn(59), rand.Intn(23))

				s.Services = append(s.Services, CFService{
					Name:     service.Name,
					Label:    service.Label,
					Plan:     service.Plan,
					Tags:     service.Tags,
					Schedule: randomSchedule, // TODO: check if service has custom backup schedule in ENV defined and use it if available
					Retention: Retention{ // TODO: check if service has custom backup retention policy in ENV defined and use it if available
						Days:  31,
						Files: 100,
					},
				})
			}
		}
	}
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
