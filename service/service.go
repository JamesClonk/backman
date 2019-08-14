package service

import (
	cfenv "github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/s3"
)

// Service is used interact with Services and dump/restore backups
type Service struct {
	App *cfenv.App
	S3  *s3.Client
}

func New(app *cfenv.App, s3 *s3.Client) *Service {
	return &Service{
		App: app,
		S3:  s3,
	}
}

// TODO: factor everything out into interfaces and subpackages that implement this???
func (s *Service) Backup(serviceType, serviceName, filename string) {}
