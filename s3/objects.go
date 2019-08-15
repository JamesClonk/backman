package s3

import (
	"io"

	"github.com/minio/minio-go/v6"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
)

func (s *Client) List(folderPath string) ([]minio.ObjectInfo, error) {
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

func (s *Client) Upload(object string, reader io.Reader, size int64) error {
	if size <= 0 {
		size = -1
	}
	n, err := s.Client.PutObject(s.BucketName, object, reader, size, minio.PutObjectOptions{ContentType: "application/gzip"})
	if err != nil {
		log.Errorf("could not upload S3 object [%s]: %v", object, err)
		return err
	}

	log.Debugf("successfully uploaded S3 object [%s] with size of [%d] bytes", object, n)
	return nil
}

func (s *Client) Download(object string) (*minio.Object, error) {
	obj, err := s.Client.GetObject(s.BucketName, object, minio.GetObjectOptions{})
	if err != nil {
		log.Errorf("could not get S3 object [%s]: %v", object, err)
		return nil, err
	}
	return obj, nil
}

func (s *Client) Delete(object string) error {
	if err := s.Client.RemoveObject(s.BucketName, object); err != nil {
		log.Errorf("could not delete S3 object [%s]: %v", object, err)
		return err
	}

	log.Debugf("successfully deleted S3 object [%s]", object)
	return nil
}
