package service

import (
	"bufio"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/cloudfoundry-community/go-cfenv"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service/mysql"
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
	objectPath := fmt.Sprintf("%s/%s/%s.gz", serviceType, serviceName, filename)

	service, err := s.App.Services.WithName(serviceName)
	if err != nil {
		log.Errorf("could not find service [%s] to backup: %v", serviceName, err)
		return err
	}

	var uploadSize int64
	var uploadError error
	var uploadWait sync.WaitGroup
	upload := func(input io.Reader) {
		uploadWait.Add(1)
		defer uploadWait.Done()
		// stream gzipping s3 uploader
		pr, pw := io.Pipe()
		gw := gzip.NewWriter(pw)
		gw.Name = filename
		gw.ModTime = time.Now()
		go func() {
			_, _ = io.Copy(gw, bufio.NewReader(input))
			gw.Close()
			pw.Close()
		}()
		uploadSize, uploadError = s.S3.Upload(objectPath, bufio.NewReader(pr), -1)
	}

	switch serviceType {
	case "mysql":
		err = mysql.Backup(service, upload)
	default:
		err = fmt.Errorf("unsupported service type [%s]", serviceType)
	}
	if err != nil {
		log.Errorf("could not backup service [%s]: %v", serviceName, err)
		return err
	}

	uploadWait.Wait()
	if uploadError != nil {
		log.Errorf("could not upload service backup [%s] to S3: %v", serviceName, err)
		return uploadError
	}

	log.Infof("successfully created & uploaded backup [%s] of size [%d bytes] to S3", objectPath, uploadSize)
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
	log.Debugf("successfully downloaded file [%s] from S3", filename)
	return localFile, nil
}

func (s *Service) DeleteBackup(serviceType, serviceName, filename string) error {
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)
	if err := s.S3.Delete(objectPath); err != nil {
		log.Errorf("could not delete S3 object [%s]: %v", objectPath, err)
		return err
	}
	log.Debugf("successfully deleted S3 object [%s]", objectPath)
	return nil
}
