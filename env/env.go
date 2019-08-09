package env

import (
	"os"

	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
)

func Get(key string, nvl string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return nvl
	}
	return value
}

func MustGet(key string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		log.Fatalf("required variable [%s] is missing", key)
	}
	return value
}
