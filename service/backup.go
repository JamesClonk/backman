package service

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/elasticsearch"
	"github.com/swisscom/backman/service/mongodb"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
	"github.com/swisscom/backman/service/redis"
	"github.com/swisscom/backman/service/util"
)

var (
	// prom metrics for backup files
	backupFilesTotal = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "backman_backup_files_total",
		Help: "Number of backup files in total per service.",
	}, []string{"type", "name"})
	backupFilesizeTotal = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "backman_backup_filesize_total",
		Help: "Total filesize sum of all backup files per service.",
	}, []string{"type", "name"})
	backupLastFilesize = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "backman_backup_filesize_last",
		Help: "Filesize of last / most recent backup file per service.",
	}, []string{"type", "name"})
)

// swagger:response backup
type Backup struct {
	Service util.Service
	Files   []File
}
type File struct {
	Key          string
	Filepath     string
	Filename     string
	Size         int64
	LastModified time.Time
}

// swagger:response backups
type Backups []Backup

func (s *Service) Backup(service util.Service) error {
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
	case util.MongoDB:
		err = mongodb.Backup(ctx, s.S3, service, envService, filename)
	case util.Redis:
		err = redis.Backup(ctx, s.S3, service, envService, filename)
	case util.MySQL:
		err = mysql.Backup(ctx, s.S3, service, envService, filename)
	case util.Postgres:
		err = postgres.Backup(ctx, s.S3, service, envService, filename)
	case util.Elasticsearch:
		err = elasticsearch.Backup(ctx, s.S3, service, envService, filename)
	default:
		err = fmt.Errorf("unsupported service type [%s]", service.Label)
	}
	if err != nil {
		log.Errorf("could not backup service [%s]: %v", service.Name, err)
		return err
	}
	log.Infof("created and uploaded backup [%s] for service [%s]", filename, service.Name)

	// only run background goroutines if not in non-background mode
	if !config.Get().Foreground {
		// cleanup files according to retention policy of service
		go func() {
			if err := s.RetentionCleanup(service); err != nil {
				log.Errorf("could not cleanup S3 storage for service [%s]: %v", service.Name, err)
			}

			// update backup files state & metrics
			_, _ = s.GetBackups(service.Label, service.Name)
		}()
	}
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

		// sort order of backup files, newest file first
		sort.Slice(files, func(i, j int) bool {
			return files[j].LastModified.Before(files[i].LastModified)
		})

		backups = append(backups, Backup{
			Service: service,
			Files:   files,
		})
	}

	// update backup files metrics
	for _, backup := range backups {
		// number of files
		backupFilesTotal.WithLabelValues(backup.Service.Label, backup.Service.Name).Set(float64(len(backup.Files)))

		// filesize sum of all files
		var filesizeTotal float64
		for _, file := range backup.Files {
			filesizeTotal += float64(file.Size)
		}
		backupFilesizeTotal.WithLabelValues(backup.Service.Label, backup.Service.Name).Set(filesizeTotal)

		// filesize of latest/newest file
		if len(backup.Files) > 0 {
			backupLastFilesize.WithLabelValues(backup.Service.Label, backup.Service.Name).Set(float64(backup.Files[0].Size))
		}
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

	// update backup files state & metrics
	go func(label, name string) {
		_, _ = s.GetBackups(label, name)
	}(serviceType, serviceName)

	return nil
}
