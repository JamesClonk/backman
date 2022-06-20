package service

import (
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/state"
)

func Init() {
	mergeVCAPServices() // finds and merges anything from VCAP_SERVICES into config.Services

	// setup service metrics
	for _, service := range config.Get().Services {
		// skip services without bindings, they are useless to us
		if len(service.Binding.Type) == 0 {
			continue
		}

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
			// skip services without bindings, they are useless to us
			if len(service.Binding.Type) == 0 {
				continue
			}
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
