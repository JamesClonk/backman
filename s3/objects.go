package s3

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"io/ioutil"
	"path/filepath"
	"sort"

	"github.com/minio/minio-go/v6"
	"github.com/minio/sio"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/scrypt"
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
	return s.UploadWithContext(context.Background(), object, reader, size)
}

func (s *Client) UploadWithContext(ctx context.Context, object string, reader io.Reader, size int64) error {
	log.Debugf("upload S3 object [%s]", object)
	if size <= 0 {
		size = -1
	}

	var err error
	uploadReader := reader
	if len(config.Get().S3.EncryptionKey) != 0 {
		key := getKey(config.Get().S3.EncryptionKey, object)
		uploadReader, err = sio.EncryptReader(reader, sio.Config{Key: key, CipherSuites: []byte{sio.AES_256_GCM}})
		if err != nil {
			log.Debugf("failed to encrypt reader: %v", err)
			return err
		}
	}

	n, err := s.Client.PutObjectWithContext(ctx, s.BucketName, object, uploadReader, size, minio.PutObjectOptions{ContentType: "application/gzip"})
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
	return s.DownloadWithContext(context.Background(), object)
}

func (s *Client) DownloadWithContext(ctx context.Context, object string) (io.ReadCloser, error) {
	log.Debugf("download S3 object [%s]", object)
	reader, err := s.Client.GetObjectWithContext(ctx, s.BucketName, object, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}

	if len(config.Get().S3.EncryptionKey) > 0 {
		key := getKey(config.Get().S3.EncryptionKey, object)
		decrypted, err := sio.DecryptReader(reader, sio.Config{Key: key, CipherSuites: []byte{sio.AES_256_GCM}})
		if err != nil {
			log.Debugf("failed to decrypt reader: %v", err)
			return nil, err
		}
		return ioutil.NopCloser(decrypted), nil
	}
	return reader, nil
}

func (s *Client) Delete(object string) error {
	log.Debugf("delete S3 object [%s]", object)
	if err := s.Client.RemoveObject(s.BucketName, object); err != nil {
		return err
	}
	return nil
}

func getKey(password, object string) []byte {
	nonce := filepath.Base(object)

	hasher := sha256.New()
	if n, err := hasher.Write([]byte(fmt.Sprintf("%s%s", password, nonce))); err != nil || n <= 0 {
		log.Fatalf("could not get salt: %v", err)
	}
	salt := hex.EncodeToString(hasher.Sum(nil))

	masterKey, err := scrypt.Key([]byte(password), []byte(salt), 32768, 8, 1, 32)
	if err != nil {
		log.Fatalf("could not get master key: %v", err)
	}

	// derive encryption key, using filename as nonce (filenames contain timestamps and are unique per backman deployment)
	var key [32]byte
	kdf := hkdf.New(sha256.New, []byte(masterKey), []byte(nonce)[:], nil)
	if _, err := io.ReadFull(kdf, key[:]); err != nil {
		log.Fatalf("failed to derive encryption key: %v", err)
	}
	return key[:]
}
