package service

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/util"
)

func (s *Service) RetentionCleanup(service util.Service) error {
	localPath := filepath.Join(service.LocalBackupPath, service.Label, service.Name)
	folderPath := fmt.Sprintf("%s/%s/", service.Label, service.Name)
	objects, err := s.S3.List(folderPath)
	if err != nil {
		return err
	}
	log.Infof("running retention cleanup of [%s] backups", folderPath)

	// remove if too old
	for _, object := range objects {
		if time.Since(object.LastModified) > time.Duration(service.Retention.Days)*time.Hour*24 {
			if err := s.S3.Delete(object.Key); err != nil {
				return err
			}
		}
	}
	// cleanup local files too
	if len(service.LocalBackupPath) > 0 {
		files, err := ioutil.ReadDir(localPath)
		if err != nil {
			return err
		}
		for _, file := range files {
			if time.Since(file.ModTime()) > time.Duration(service.Retention.Days)*time.Hour*24 {
				log.Debugf("deleting old backup file [%s] ...", filepath.Join(localPath, file.Name()))
				if err := os.Remove(filepath.Join(localPath, file.Name())); err != nil {
					return err
				}
			}
		}
	}

	// remove if too many files
	sort.Slice(objects, func(i, j int) bool {
		return objects[i].LastModified.Before(objects[j].LastModified)
	})
	if len(objects) > service.Retention.Files {
		for i := 0; i < len(objects)-service.Retention.Files; i++ {
			if err := s.S3.Delete(objects[i].Key); err != nil {
				return err
			}
		}
	}
	// cleanup local files too
	if len(service.LocalBackupPath) > 0 {
		files, err := ioutil.ReadDir(filepath.Join(service.LocalBackupPath, service.Label, service.Name))
		if err != nil {
			return err
		}
		sort.Slice(files, func(i, j int) bool {
			return files[i].ModTime().Before(files[j].ModTime())
		})
		if len(files) > service.Retention.Files {
			for i := 0; i < len(files)-service.Retention.Files; i++ {
				log.Debugf("deleting superfluous backup file [%s] ...", filepath.Join(localPath, files[i].Name()))
				if err := os.Remove(filepath.Join(localPath, files[i].Name())); err != nil {
					return err
				}
			}
		}
	}
	return nil
}
