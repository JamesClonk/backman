package redis

import (
	"context"
	"fmt"
	"path/filepath"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/state"
)

func Restore(ctx context.Context, s3 *s3.Client, service config.Service, target config.Service, objectPath string) error {
	state.RestoreQueue(service)

	log.Errorln("restoring redis is not supported, please contact your redis database administrator")
	filename := filepath.Base(objectPath)
	state.RestoreFailure(service, filename)

	return fmt.Errorf("redis restore: unsupported")
}
