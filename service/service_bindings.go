package service

import (
	"github.com/nebhale/client-go/bindings"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
)

func mergeServiceBindings() {
	// TODO: this needs to be implemented, parse SERVICE_BINDING_ROOT/<services> here..

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
	serviceBindings := bindings.From(config.Get().ServiceBindingRoot)

	services := make([]config.Service, 0)
	for _, serviceBinding := range serviceBindings {
		bindingType, found := bindings.Get(serviceBinding, "type")
		if !found {
			log.Errorf("could not determine [type] of service binding [%s]", serviceBinding.GetName())
		}
		bindingProvider, _ := bindings.Get(serviceBinding, "provider")
		bindingPlan, _ := bindings.Get(serviceBinding, "plan")
		bindingURI, _ := bindings.Get(serviceBinding, "uri")
		bindingHost, _ := bindings.Get(serviceBinding, "host")
		bindingPort, _ := bindings.Get(serviceBinding, "port")
		bindingUsername, _ := bindings.Get(serviceBinding, "username")
		bindingPassword, _ := bindings.Get(serviceBinding, "password")
		bindingDatabase, _ := bindings.Get(serviceBinding, "database")

		// exclude S3 storage service, don't try to parse it as a service for backups
		if bindingType == config.Get().S3.ServiceName ||
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
			}
			if len(config.Get().S3.AccessKey) == 0 {
				config.Get().S3.AccessKey = bindingUsername
			}
			if len(config.Get().S3.SecretKey) == 0 {
				config.Get().S3.SecretKey = bindingPassword
			}
			continue
		}

		// TODO: below code
		// // if it is an unrecognized type/label or user-provided service
		// // then try to figure out if it can be identified as a supported service type
		// if !config.IsValidServiceType(vcapService.Label) || vcapService.Label == "user-provided" {
		// 	// can it be identified as a custom postgres binding?
		// 	if postgres.IsVCAPPostgresBinding(&vcapService) {
		// 		vcapService.Label = "postgres"
		// 	} else if mysql.IsVCAPMySQLBinding(&vcapService) { // or a mysql binding?
		// 		vcapService.Label = "mysql"
		// 	} else if redis.IsVCAPRedisBinding(&vcapService) { // or a redis binding?
		// 		vcapService.Label = "redis"
		// 	} else {
		// 		// try to guess it via service tags as a last resort
		// 		var identified bool
		// 		for _, tag := range vcapService.Tags {
		// 			if config.IsValidServiceType(tag) {
		// 				identified = true
		// 				vcapService.Label = tag
		// 				break
		// 			}
		// 		}
		// 		if !identified {
		// 			log.Errorf("unsupported service type [%s]: could not identify [%s]", vcapService.Label, vcapService.Name)
		// 			continue // cannot handle this service binding
		// 		}
		// 	}
		// }

		// // build service binding out of VCAP_SERVICES
		// binding := config.ServiceBinding{
		// 	Type: vcapService.Label,
		// 	Plan: vcapService.Plan,
		// }
		// switch config.ParseServiceType(vcapService.Label) {
		// case config.Elasticsearch:
		// 	username, _ := vcapService.CredentialString("full_access_username")
		// 	password, _ := vcapService.CredentialString("full_access_password")
		// 	if len(username) == 0 {
		// 		username, _ = vcapService.CredentialString("username")
		// 	}
		// 	if len(password) == 0 {
		// 		password, _ = vcapService.CredentialString("password")
		// 	}
		// 	binding.Username = username
		// 	binding.Password = password
		// 	binding.Host, _ = vcapService.CredentialString("host")
		// 	binding.URI, _ = vcapService.CredentialString("uri")
		// 	if len(binding.Host) == 0 {
		// 		binding.Host = binding.URI
		// 	}

		// case config.MongoDB:
		// 	port, _ := vcapService.CredentialString("port")
		// 	portnum, _ := strconv.Atoi(port)
		// 	binding.Port = portnum
		// 	binding.Host, _ = vcapService.CredentialString("host")
		// 	binding.URI, _ = vcapService.CredentialString("uri")
		// 	binding.Username, _ = vcapService.CredentialString("username")
		// 	binding.Password, _ = vcapService.CredentialString("password")
		// 	binding.Database, _ = vcapService.CredentialString("database")

		// case config.MySQL:
		// 	credentials := mysql.GetVCAPCredentials(&vcapService)
		// 	binding.Host = credentials.Hostname
		// 	binding.Port = credentials.Port
		// 	binding.URI, _ = vcapService.CredentialString("uri")
		// 	binding.Username = credentials.Username
		// 	binding.Password = credentials.Password
		// 	binding.Database = credentials.Database

		// case config.Postgres:
		// 	credentials := postgres.GetVCAPCredentials(&vcapService)
		// 	binding.Host = credentials.Hostname
		// 	binding.Port = credentials.Port
		// 	binding.URI, _ = vcapService.CredentialString("uri")
		// 	binding.Username = credentials.Username
		// 	binding.Password = credentials.Password
		// 	binding.Database = credentials.Database

		// case config.Redis:
		// 	credentials := redis.GetVCAPCredentials(&vcapService)
		// 	binding.Host = credentials.Hostname
		// 	binding.Port = credentials.Port
		// 	binding.URI, _ = vcapService.CredentialString("uri")
		// 	binding.Password = credentials.Password
		// }

		// newService := config.Service{
		// 	Name:    vcapService.Name,
		// 	Binding: binding,
		// }
		// services = append(services, newService)
	}
	return services, nil
}
