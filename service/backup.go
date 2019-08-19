package service

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/config"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service/mysql"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service/postgres"
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

func (s *Service) Backup(service CFService, filename string) error {
	objectPath := fmt.Sprintf("%s/%s/%s", service.Label, service.Name, filename)

	// if file-based temporary backup storage
	var file *os.File
	if !config.Get().Backup.InMemory {
		// create temporary folders & file
		backupFile := fmt.Sprintf("backups/%s", objectPath)
		if err := os.MkdirAll(filepath.Dir(backupFile), 0750); err != nil {
			log.Errorf("could not create backup directory [%s]: %v", filepath.Dir(backupFile), err)
			return err
		}

		// open file for reading & writing to it
		var err error
		file, err = os.OpenFile(backupFile, os.O_RDWR|os.O_TRUNC|os.O_CREATE, 0660)
		if err != nil {
			log.Errorf("could not open backup file [%s]: %v", backupFile, err)
			return err
		}
		defer file.Close()
		defer os.Remove(backupFile) // delete temporary file afterwards
	}

	envService, err := s.App.Services.WithName(service.Name)
	if err != nil {
		log.Errorf("could not find service [%s] to backup: %v", service.Name, err)
		return err
	}

	// ctx to abort backup if this takes longer than defined timeout
	ctx, cancel := context.WithTimeout(context.Background(), service.Timeout)
	defer cancel()

	var reader io.Reader
	switch service.Label {
	case "mysql", "mariadb", "mariadbent", "pxc":
		reader, err = mysql.Backup(ctx, envService, file)
	case "postgres", "pg", "postgresql", "elephantsql", "citusdb":
		reader, err = postgres.Backup(ctx, envService, file)
	default:
		err = fmt.Errorf("unsupported service type [%s]", service.Label)
	}
	if err != nil {
		log.Errorf("could not backup service [%s]: %v", service.Name, err)
		return err
	}

	// if file-based temporary backup storage
	if !config.Get().Backup.InMemory {
		// reset to beginning of file
		if _, err := file.Seek(0, 0); err != nil {
			log.Errorf("could not reset backup file [%s]: %v", file.Name(), err)
			return err
		}
		reader = file
	}

	if err := s.S3.Upload(objectPath, bufio.NewReader(reader), -1); err != nil {
		log.Errorf("could not upload service backup [%s] to S3: %v", service.Name, err)
		return err
	}

	log.Infof("created and uploaded backup [%s]", objectPath)

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
