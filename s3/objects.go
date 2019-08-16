package s3

import (
	"io"

	"github.com/minio/minio-go/v6"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
)

func (s *Client) List(folderPath string) ([]minio.ObjectInfo, error) {
	log.Debugf("list S3 object [%s]", folderPath)
	doneCh := make(chan struct{})
	defer close(doneCh)

	isRecursive := true
	objects := make([]minio.ObjectInfo, 0)
	objectCh := s.Client.ListObjectsV2(s.BucketName, folderPath, isRecursive, doneCh)
	for object := range objectCh {
		if object.Err != nil {
			return nil, object.Err
		}
		objects = append(objects, object)
	}
	return objects, nil
}

func (s *Client) Upload(object string, reader io.Reader, size int64) error {
	log.Debugf("upload S3 object [%s]", object)
	if size <= 0 {
		size = -1
	}
	n, err := s.Client.PutObject(s.BucketName, object, reader, size, minio.PutObjectOptions{ContentType: "application/gzip"})
	if err != nil {
		return err
	}
	log.Debugf("uploaded S3 object [%s] of size [%d] bytes", object, n)
	return nil
}

func (s *Client) Stat(object string) (*minio.ObjectInfo, error) {
	log.Debugf("stat S3 object [%s]", object)
	stat, err := s.Client.StatObject(s.BucketName, object, minio.StatObjectOptions{})
	if err != nil {
		return nil, err
	}
	return &stat, nil
}

func (s *Client) Download(object string) (*minio.Object, error) {
	log.Debugf("download S3 object [%s]", object)
	obj, err := s.Client.GetObject(s.BucketName, object, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	return obj, nil
}

func (s *Client) Delete(object string) error {
	log.Debugf("delete S3 object [%s]", object)
	if err := s.Client.RemoveObject(s.BucketName, object); err != nil {
		return err
	}
	return nil
}