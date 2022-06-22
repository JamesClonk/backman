package mongodb

import (
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
)

func VerifyBinding(service config.Service) bool {
	valid := true

	if len(service.Binding.URI) == 0 {
		log.Errorf("service binding for [%s] is missing property: [uri]", service.Name)
		valid = false
	}

	return valid
}
