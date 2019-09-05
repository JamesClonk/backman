package service

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/elasticsearch"
	"github.com/swisscom/backman/service/mongodb"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
)

type Backup struct {
	Service CFService
	Files   []File
}
type File struct {
	Key          string
	Filepath     string
	Filename     string
	Size         int64
	LastModified time.Time
}

func (s *Service) Backup(service CFService) error {
	filename := fmt.Sprintf("%s_%s.gz", service.Name, time.Now().Format("20060102150405"))

	envService, err := s.App.Services.WithName(service.Name)
	if err != nil {
		log.Errorf("could not find service [%s] to backup: %v", service.Name, err)
		return err
	}

	// ctx to abort backup if this takes longer than defined timeout
	ctx, cancel := context.WithTimeout(context.Background(), service.Timeout)
	defer cancel()

	switch service.Type() {
	case MongoDB:
		err = mongodb.Backup(ctx, s.S3, envService, filename)
	case MySQL:
		err = mysql.Backup(ctx, s.S3, envService, filename)
	case Postgres:
		err = postgres.Backup(ctx, s.S3, envService, filename)
	case Elasticsearch:
		err = elasticsearch.Backup(ctx, s.S3, envService, filename)
	default:
		err = fmt.Errorf("unsupported service type [%s]", service.Label)
	}
	if err != nil {
		log.Errorf("could not backup service [%s]: %v", service.Name, err)
		return err
	}
	log.Infof("created and uploaded backup [%s] for service [%s]", filename, service.Name)

	// cleanup files according to retention policy of service
	go func() {
		if err := s.RetentionCleanup(service); err != nil {
			log.Errorf("could not cleanup S3 storage for service [%s]: %v", service.Name, err)
		}
	}()
	return err
}

func (s *Service) GetBackups(serviceType, serviceName string) ([]Backup, error) {
	backups := make([]Backup, 0)

	for _, service := range s.GetServices(serviceType, serviceName) {
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
			Service: service,
			Files:   files,
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
		Service: s.GetService(serviceType, serviceName),
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
