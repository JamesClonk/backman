package s3

import (
	"context"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"sort"

	"github.com/minio/minio-go/v6"
	"github.com/minio/sio"
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
	key := os.Getenv("BACKMAN_ENCRYPTION_KEY")
	if len(key) != 0 {
		masterkey, err := hex.DecodeString(key) // use your own key here
		if err != nil {
			fmt.Printf("Cannot decode hex key: %v", err) // add error handling
			return err
		}

		reader, err = sio.EncryptReader(reader, sio.Config{Key: masterkey[:]})
		if err != nil {
			fmt.Printf("Failed to encrypted reader: %v", err) // add error handling
			return err
		}
	}
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

	key := os.Getenv("BACKMAN_ENCRYPTION_KEY")
	if len(key) != 0 {
		masterkey, err := hex.DecodeString(key) // use your own key here
		if err != nil {
			fmt.Printf("Cannot decode hex key: %v", err) // add error handling
			return nil, err
		}

		decrypted, err := sio.DecryptReader(reader, sio.Config{Key: masterkey[:]})
		if err != nil {
			fmt.Printf("Failed to encrypted reader: %v", err) // add error handling
			return nil, err
		}
		return decrypted, nil
	}

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
