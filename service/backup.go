package service

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service/mysql"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service/postgres"
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

func (s *Service) Backup(serviceType, serviceName, filename string) error {
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)

	service, err := s.App.Services.WithName(serviceName)
	if err != nil {
		log.Errorf("could not find service [%s] to backup: %v", serviceName, err)
		return err
	}

	var reader io.Reader
	switch serviceType {
	case "mysql", "mariadb", "mariadbent", "pxc":
		reader, err = mysql.Backup(service)
	case "postgres", "pg", "postgresql", "elephantsql", "citusdb":
		reader, err = postgres.Backup(service)
	default:
		err = fmt.Errorf("unsupported service type [%s]", serviceType)
	}
	if err != nil {
		log.Errorf("could not backup service [%s]: %v", serviceName, err)
		return err
	}

	if err := s.S3.Upload(objectPath, bufio.NewReader(reader), -1); err != nil {
		log.Errorf("could not upload service backup [%s] to S3: %v", serviceName, err)
		return err
	}

	log.Infof("created and uploaded backup [%s]", objectPath)
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
		objects, err := s.S3.List(objectPath)
		if err != nil {
			log.Errorf("could not list S3 objects: %v", err)
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

func (s *Service) GetBackup(serviceType, serviceName, filename string) (*Backup, error) {
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)

	obj, err := s.S3.Stat(objectPath)
	if err != nil {
		log.Errorf("could not find backup file [%s]: %v", objectPath, err)
		return nil, err
	}
	return &Backup{
		ServiceType: serviceType,
		ServiceName: serviceName,
		Files: []File{
			File{
				Key:          obj.Key,
				Filepath:     filepath.Dir(obj.Key),
				Filename:     filepath.Base(obj.Key),
				Size:         obj.Size,
				LastModified: obj.LastModified,
			},
		},
	}, err
}

func (s *Service) BackupExists(serviceType, serviceName, filename string) bool {
	b, _ := s.GetBackup(serviceType, serviceName, filename)
	return b.Files[0].Size > 0
}

func (s *Service) ReadBackup(serviceType, serviceName, filename string) (io.Reader, error) {
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)
	return s.S3.Download(objectPath)
}

func (s *Service) DownloadBackup(serviceType, serviceName, filename string) (*os.File, error) {
	object, err := s.ReadBackup(serviceType, serviceName, filename)
	if err != nil {
		log.Errorf("could not download backup file [%s]: %v", object, err)
		return nil, err
	}

	localFile, err := os.Create(filename)
	if err != nil {
		log.Errorf("could not create backup file [%s]: %v", filename, err)
		return nil, err
	}
	if _, err = io.Copy(localFile, object); err != nil {
		log.Errorf("could not write backup file [%s]: %v", filename, err)
		return nil, err
	}
	log.Infof("downloaded file [%s]", filename)
	return localFile, nil
}

func (s *Service) DeleteBackup(serviceType, serviceName, filename string) error {
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)
	if err := s.S3.Delete(objectPath); err != nil {
		log.Errorf("could not delete S3 object [%s]: %v", objectPath, err)
		return err
	}
	log.Infof("deleted file [%s]", objectPath)
	return nil
}
