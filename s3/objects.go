package s3

import (
	"context"
	"io"
	"sort"

	"github.com/minio/minio-go/v6"
	"github.com/swisscom/backman/log"
)

func (s *Client) List(folderPath string) ([]minio.ObjectInfo, error) {
	log.Debugf("list S3 object [%s]", folderPath)

	objects := make([]minio.ObjectInfo, 0)
	done := make(chan struct{})
	defer close(done)

	isRecursive := true
	objectCh := s.Client.ListObjectsV2(s.BucketName, folderPath, isRecursive, done)
	for object := range objectCh {
		if object.Err != nil {
			return nil, object.Err
		}
		objects = append(objects, object)
	}

	sort.Slice(objects, func(i, j int) bool {
		return objects[i].LastModified.Before(objects[j].LastModified)
	})
	return objects, nil
}

func (s *Client) Upload(object string, reader io.Reader, size int64) error {
	// if len(config.Get().S3.EncryptionKey) != 0 {
	// 	masterkey, err := hex.DecodeString(config.Get().S3.EncryptionKey) // use your own key here
	// 	if err != nil {
	// 		log.Debugf("Cannot decode hex key: %v", err)
	// 		return err
	// 	}

	// 	reader, err = sio.EncryptReader(reader, sio.Config{Key: masterkey[:]})
	// 	if err != nil {
	// 		log.Debugf("Failed to encrypted reader: %v", err)
	// 		return err
	// 	}
	// }
	return s.UploadWithContext(context.Background(), object, reader, size)
}

func (s *Client) UploadWithContext(ctx context.Context, object string, reader io.Reader, size int64) error {
	log.Debugf("upload S3 object [%s]", object)
	if size <= 0 {
		size = -1
	}
	n, err := s.Client.PutObjectWithContext(ctx, s.BucketName, object, reader, size, minio.PutObjectOptions{ContentType: "application/gzip"})
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

func (s *Client) Download(object string) (io.Reader, error) {
	reader, err := s.DownloadWithContext(context.Background(), object)
	if err != nil {
		return nil, err
	}

	// if len(config.Get().S3.EncryptionKey) > 0 {
	// 	masterkey, err := hex.DecodeString(config.Get().S3.EncryptionKey)
	// 	if err != nil {
	// 		log.Debugf("Cannot decode hex key: %v", err)
	// 		return nil, err
	// 	}

	// 	decrypted, err := sio.DecryptReader(reader, sio.Config{Key: masterkey[:]})
	// 	if err != nil {
	// 		log.Debugf("Failed to encrypted reader: %v", err)
	// 		return nil, err
	// 	}
	// 	return decrypted, nil
	// }
	return reader, nil
}

func (s *Client) DownloadWithContext(ctx context.Context, object string) (*minio.Object, error) {
	log.Debugf("download S3 object [%s]", object)
	obj, err := s.Client.GetObjectWithContext(ctx, s.BucketName, object, minio.GetObjectOptions{})
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
