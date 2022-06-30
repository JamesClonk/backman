package service

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/nebhale/client-go/bindings"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
)

func mergeServiceBindings() {
	serviceBindings, err := parseServiceBindings()
	if err != nil {
		log.Errorf("could not parse SERVICE_BINDING_ROOT [%s]: %v", config.Get().ServiceBindingRoot, err)
	}

	for _, sb := range serviceBindings {
		if service, found := config.Get().Services[sb.Name]; found {
			// only merge service binding if service already exists in config.Services
			service.Binding = sb.Binding
			config.Get().Services[sb.Name] = service
		} else {
			// otherwise insert entire service into config.Services
			config.Get().Services[sb.Name] = sb
		}
	}
}

func parseServiceBindings() ([]config.Service, error) {
	// read and go through all services bindings in SERVICE_BINDING_ROOT/*
	services := make([]config.Service, 0)
	for _, serviceBinding := range bindings.From(config.Get().ServiceBindingRoot) {
		bindingType, found := bindings.Get(serviceBinding, "type")
		if !found {
			log.Errorf("could not determine [type] of service binding [%s]", serviceBinding.GetName())
			continue
		}

		bindingProvider, _ := bindings.Get(serviceBinding, "provider")
		bindingPlan, _ := bindings.Get(serviceBinding, "plan")
		bindingURI, _ := bindings.Get(serviceBinding, "uri")
		bindingHost, _ := bindings.Get(serviceBinding, "host")
		port, _ := bindings.Get(serviceBinding, "port")
		bindingPort, _ := strconv.Atoi(port)
		bindingUsername, _ := bindings.Get(serviceBinding, "username")
		bindingAccessKey, _ := bindings.Get(serviceBinding, "access_key") // for S3
		bindingPassword, _ := bindings.Get(serviceBinding, "password")
		bindingSecretKey, _ := bindings.Get(serviceBinding, "secret_key") // for S3
		bindingDatabase, _ := bindings.Get(serviceBinding, "database")

		// exclude S3 storage service, don't try to parse it as a service for backups
		if serviceBinding.GetName() == config.Get().S3.ServiceName ||
			(bindingType == config.Get().S3.ServiceLabel && bindingType != "user-provided") ||
			bindingType == "s3" ||
			bindingType == "dynstrg" ||
			bindingType == "dynstrg-2" ||
			bindingType == "dynstrg-3" ||
			bindingType == "minio" {
			// but we will save its credentials into config.S3.* if not already present

			// this check here is necessary since there could be multiple possible S3 services in SERVICE_BINDING_ROOT/*
			if len(config.Get().S3.ServiceName) > 0 && serviceBinding.GetName() != config.Get().S3.ServiceName {
				continue // this does not seem to be the specific S3 service the user wants to use for storing backups
			}

			if len(config.Get().S3.BucketName) == 0 { // fallback to service binding's name
				config.Get().S3.BucketName = serviceBinding.GetName()
			}
			if len(config.Get().S3.Host) == 0 {
				config.Get().S3.Host = bindingHost
				if !strings.Contains(bindingHost, ":") && bindingPort > 0 {
					config.Get().S3.Host = fmt.Sprintf("%s:%d", bindingHost, bindingPort)
				}
			}
			if len(config.Get().S3.AccessKey) == 0 {
				config.Get().S3.AccessKey = bindingAccessKey
			}
			if len(config.Get().S3.AccessKey) == 0 {
				config.Get().S3.AccessKey = bindingUsername // fallback to 'username' if 'access_key' was empty
			}
			if len(config.Get().S3.SecretKey) == 0 {
				config.Get().S3.SecretKey = bindingSecretKey
			}
			if len(config.Get().S3.SecretKey) == 0 {
				config.Get().S3.SecretKey = bindingPassword // fallback to 'password' if 'secret_key' was empty
			}
			continue
		}

		newService := config.Service{
			Name: serviceBinding.GetName(),
			Binding: config.ServiceBinding{
				Type:     bindingType,
				Provider: bindingProvider,
				Plan:     bindingPlan,
				URI:      bindingURI,
				Host:     bindingHost,
				Port:     bindingPort,
				Username: bindingUsername,
				Password: bindingPassword,
				Database: bindingDatabase,
			},
		}
		services = append(services, newService)
	}
	return services, nil
}
