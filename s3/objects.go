package s3

import (
	"io"

	"github.com/minio/minio-go/v6"
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
			return nil, object.Err
		}
		objects = append(objects, object)
	}
	return objects, nil
}

func (s *Client) Upload(object string, reader io.Reader, size int64) (int64, error) {
	if size <= 0 {
		size = -1
	}
	n, err := s.Client.PutObject(s.BucketName, object, reader, size, minio.PutObjectOptions{ContentType: "application/gzip"})
	if err != nil {
		return -1, err
	}
	return n, nil
}

func (s *Client) Stat(object string) (*minio.ObjectInfo, error) {
	stat, err := s.Client.StatObject(s.BucketName, object, minio.StatObjectOptions{})
	if err != nil {
		return nil, err
	}
	return &stat, nil
}

func (s *Client) Download(object string) (*minio.Object, error) {
	obj, err := s.Client.GetObject(s.BucketName, object, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	return obj, nil
}

func (s *Client) Delete(object string) error {
	if err := s.Client.RemoveObject(s.BucketName, object); err != nil {
		return err
	}
	return nil
}
