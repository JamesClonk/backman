package service

import (
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/util"
)

type File struct {
	Key          string
	Filepath     string
	Filename     string
	Size         int64
	LastModified time.Time
}

type Backup struct {
	ServiceType string
	ServiceName string
	Files       []File
}

// TODO: factor everything out into interfaces and subpackages that implement this???
func (s *Service) Backup(serviceType, serviceName, filename string) error {
	// TODO: call backup background goroutine
	return nil
}

func (s *Service) GetBackups(serviceType, serviceName string) ([]Backup, error) {
	var services []cfenv.Service
	if len(serviceName) > 0 {
		// list backups only for a specific service binding
		service, err := s.App.Services.WithName(serviceName)
		if err != nil {
			return nil, err
		}
		services = append(services, *service)
	} else if len(serviceType) > 0 {
		// list backups only for a specific service type
		var err error
		services, err = s.App.Services.WithLabel(serviceType)
		if err != nil {
			return nil, err
		}
	} else {
		// list backups for all services
		for label, s := range s.App.Services {
			if util.IsValidServiceType(label) {
				services = append(services, s...)
			}
		}
	}

	backups := make([]Backup, 0)
	for _, service := range services {
		objectPath := fmt.Sprintf("%s/%s/", service.Label, service.Name)
		objects, err := s.S3.ListObjects(objectPath)
		if err != nil {
			return nil, err
		}

		// collect backup files
		files := make([]File, 0)
		for _, obj := range objects {
			// exclude "directories"
			if obj.Key != objectPath && !strings.Contains(objectPath, filepath.Base(obj.Key)) {
				files = append(files, File{
					Key:          obj.Key,
					Filepath:     filepath.Dir(obj.Key),
					Filename:     filepath.Base(obj.Key),
					Size:         obj.Size,
					LastModified: obj.LastModified,
				})
			}
		}

		backups = append(backups, Backup{
			ServiceType: service.Label,
			ServiceName: service.Name,
			Files:       files,
		})
	}
	return backups, nil
}

func (s *Service) DeleteBackup(serviceType, serviceName, filename string) error {
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)
	return s.S3.DeleteObject(objectPath)
}
