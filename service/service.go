package service

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/state"
)

func init() {
	rand.Seed(time.Now().UTC().UnixNano())
}

func Init() {
	mergeServiceBindings() // finds and merges SERVICE_BINDING_ROOT/<service> into config.Services
	mergeVCAPServices()    // finds and merges VCAP_SERVICES into config.Services

	validateServices() // final validation of all service instances in config.Services

	// setup service metrics
	for _, service := range config.Get().Services {
		// init prometheus state metrics to 0
		state.BackupInit(service)
		state.RestoreInit(service)

		// init backup files state & metrics in background
		go func(serviceType, name string) {
			_, _ = GetBackups(serviceType, name)
		}(service.Binding.Type, service.Name)
	}

	log.Debugf("services loaded: %+v", config.Get().Services)
}

func validateServices() {
	for serviceName, service := range config.Get().Services {
		// remove services without bindings, they are useless to us / invalid
		if len(service.Binding.Type) == 0 {
			log.Errorf("ignoring service [%s], it does not seem to have a valid binding", serviceName)
			delete(config.Get().Services, serviceName)
			continue
		}

		service.Name = serviceName // service name must be the map-key

		// read timeout for service
		if service.Timeout.Seconds() <= 1 {
			service.Timeout.Duration = 1 * time.Hour // default
		}

		// read crontab schedule for service
		if len(service.Schedule) == 0 {
			// create a random schedule for daily backup as a fallback
			service.Schedule = fmt.Sprintf("%d %d %d * * *", rand.Intn(59), rand.Intn(59), rand.Intn(23))
		}

		// read retention days & files, with defaults as fallback
		if service.Retention.Days <= 0 {
			service.Retention.Days = 31 // default
		}
		if service.Retention.Files <= 0 {
			service.Retention.Files = 100 // default
		}

		// write values back
		config.Get().Services[serviceName] = service
	}
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
