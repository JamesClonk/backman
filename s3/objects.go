package s3

import (
	"github.com/minio/minio-go/v6"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
)

func (s *Client) ListObjects(folderPath string) ([]minio.ObjectInfo, error) {
	// read objects from S3
	doneCh := make(chan struct{})
	defer close(doneCh)

	isRecursive := true
	objects := make([]minio.ObjectInfo, 0)
	objectCh := s.Client.ListObjectsV2(s.BucketName, folderPath, isRecursive, doneCh)
	for object := range objectCh {
		if object.Err != nil {
			log.Errorf("could not read S3 object: %v", object.Err)
			return nil, object.Err
		}
		objects = append(objects, object)
	}
	return objects, nil
}

func (s *Client) DeleteObject(object string) error {
	// delete object from S3
	if err := s.Client.RemoveObject(s.BucketName, object); err != nil {
		log.Errorf("could not delete S3 object [%s]: %v", object, err)
		return err
	}
	return nil
}
