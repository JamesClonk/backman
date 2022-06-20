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
	"github.com/swisscom/backman/s3"
	"github.com/swisscom/backman/service/elasticsearch"
	"github.com/swisscom/backman/service/mongodb"
	"github.com/swisscom/backman/service/mysql"
	"github.com/swisscom/backman/service/postgres"
	"github.com/swisscom/backman/service/redis"
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
	Service config.Service
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

func CreateBackup(service config.Service) error {
	filename := fmt.Sprintf("%s_%s.gz", service.Name, time.Now().Format("20060102150405"))

	// ctx to abort backup if this takes longer than defined timeout
	ctx, cancel := context.WithTimeout(context.Background(), service.Timeout.Duration)
	defer cancel()

	var err error
	switch service.Type() {
	case config.MongoDB:
		err = mongodb.Backup(ctx, s3.Get(), service, filename)
	case config.Redis:
		err = redis.Backup(ctx, s3.Get(), service, filename)
	case config.MySQL:
		err = mysql.Backup(ctx, s3.Get(), service, filename)
	case config.Postgres:
		err = postgres.Backup(ctx, s3.Get(), service, filename)
	case config.Elasticsearch:
		err = elasticsearch.Backup(ctx, s3.Get(), service, filename)
	default:
		err = fmt.Errorf("unsupported service type [%s]", service.Binding.Type)
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
			if err := RetentionCleanup(service); err != nil {
				log.Errorf("could not cleanup S3 storage for service [%s]: %v", service.Name, err)
			}

			// update backup files state & metrics
			_, _ = GetBackups(service.Binding.Type, service.Name)
		}()
	}
	return err
}

func GetBackups(serviceType, serviceName string) ([]Backup, error) {
	backups := make([]Backup, 0)

	for _, service := range GetServices(serviceType, serviceName) {
		objectPath := fmt.Sprintf("%s/%s/", service.Binding.Type, service.Name)
		objects, err := s3.Get().List(objectPath)
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
		backupFilesTotal.WithLabelValues(backup.Service.Binding.Type, backup.Service.Name).Set(float64(len(backup.Files)))

		// filesize sum of all files
		var filesizeTotal float64
		for _, file := range backup.Files {
			filesizeTotal += float64(file.Size)
		}
		backupFilesizeTotal.WithLabelValues(backup.Service.Binding.Type, backup.Service.Name).Set(filesizeTotal)

		// filesize of latest/newest file
		if len(backup.Files) > 0 {
			backupLastFilesize.WithLabelValues(backup.Service.Binding.Type, backup.Service.Name).Set(float64(backup.Files[0].Size))
		}
	}

	return backups, nil
}

func GetBackup(serviceType, serviceName, filename string) (*Backup, error) {
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)

	obj, err := s3.Get().Stat(objectPath)
	if err != nil {
		log.Errorf("could not find backup file [%s]: %v", objectPath, err)
		return nil, err
	}
	return &Backup{
		Service: GetService(serviceType, serviceName),
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

func BackupExists(serviceType, serviceName, filename string) bool {
	b, _ := GetBackup(serviceType, serviceName, filename)
	return b.Files[0].Size > 0
}

func ReadBackup(serviceType, serviceName, filename string) (io.Reader, error) {
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)
	return s3.Get().Download(objectPath)
}

func DownloadBackup(serviceType, serviceName, filename string) (*os.File, error) {
	object, err := ReadBackup(serviceType, serviceName, filename)
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

func DeleteBackup(serviceType, serviceName, filename string) error {
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)
	if err := s3.Get().Delete(objectPath); err != nil {
		log.Errorf("could not delete S3 object [%s]: %v", objectPath, err)
		return err
	}
	log.Infof("deleted file [%s]", objectPath)

	// update backup files state & metrics
	go func(serviceType, name string) {
		_, _ = GetBackups(serviceType, name)
	}(serviceType, serviceName)

	return nil
}
