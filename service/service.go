package service

import (
	cfenv "github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/s3"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/util"
)

// Service is used interact with services and dump/restore backups
type Service struct {
	App *cfenv.App
	S3  *s3.Client
}

type CFService struct {
	Name  string
	Label string
	Plan  string
	Tags  []string
}

func New(app *cfenv.App, s3 *s3.Client) *Service {
	return &Service{
		App: app,
		S3:  s3,
	}
}

func (s *Service) GetServices(serviceType, serviceName string) ([]CFService, error) {
	cfServices := make([]CFService, 0)
	if len(serviceName) > 0 {
		// list only a specific service binding
		service, err := s.App.Services.WithName(serviceName)
		if err != nil {
			return nil, err
		}
		cfServices = append(cfServices, CFService{
			Name:  service.Name,
			Label: service.Label,
			Plan:  service.Label,
			Tags:  service.Tags,
		})

	} else if len(serviceType) > 0 {
		// list services only for a specific service type
		services, err := s.App.Services.WithLabel(serviceType)
		if err != nil {
			return nil, err
		}
		for _, service := range services {
			cfServices = append(cfServices, CFService{
				Name:  service.Name,
				Label: service.Label,
				Plan:  service.Label,
				Tags:  service.Tags,
			})
		}

	} else {
		// list all (valid) services
		for label, services := range s.App.Services {
			if util.IsValidServiceType(label) {
				for _, service := range services {
					cfServices = append(cfServices, CFService{
						Name:  service.Name,
						Label: service.Label,
						Plan:  service.Label,
						Tags:  service.Tags,
					})
				}
			}
		}
	}
	return cfServices, nil
}
