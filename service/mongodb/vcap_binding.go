package mongodb

import (
	"strings"

	"github.com/cloudfoundry-community/go-cfenv"
)

func IsVCAPBinding(binding *cfenv.Service) bool {
	for key := range binding.Credentials {
		switch key {
		case "database_uri", "jdbcUrl", "jdbc_url", "url", "uri":
			if uri, _ := binding.CredentialString(key); len(uri) > 0 && strings.Contains(uri, "mongodb://") {
				return true
			}
		}
	}
	return false
}
