package service

import (
	"fmt"
	"sort"
	"time"

	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/util"
)

func (s *Service) RetentionCleanup(service util.Service) error {
	folderPath := fmt.Sprintf("%s/%s/", service.Label, service.Name)
	objects, err := s.S3.List(folderPath)
	if err != nil {
		return err
	}
	log.Infof("running retention cleanup of [%s] backups", folderPath)

	// remove if too old
	for _, object := range objects {
		if time.Now().Sub(object.LastModified) > time.Duration(service.Retention.Days)*time.Hour*24 {
			if err := s.S3.Delete(object.Key); err != nil {
				return err
			}
		}
	}
	// cleanup local files too
	if len(service.LocalBackupPath) > 0 {
		// TODO: this!
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
		// TODO: this!
	}
	return nil
}
