package s3

import (
	"crypto/tls"
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/minio/minio-go/v6"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
)

var (
	client Client
	once   sync.Once
)

// Client is used interact with S3 storage
type Client struct {
	Client     *minio.Client
	BucketName string
	Endpoint   string
	AccessKey  string
	SecretKey  string
}

func Get() *Client {
	once.Do(func() {
		client = *new()
	})
	return &client
}

func new() *Client {
	// check if Config.S3.Host/AccessKey/SecretKey are set
	if len(config.Get().S3.Host) == 0 ||
		len(config.Get().S3.AccessKey) == 0 ||
		len(config.Get().S3.SecretKey) == 0 {
		log.Fatalf("could not find S3 credentials in configuration")
	}

	if len(config.Get().S3.BucketName) == 0 {
		log.Fatalln("bucket name for S3 storage is not configured properly")
	}

	minioClient, err := minio.NewV4(
		config.Get().S3.Host,
		config.Get().S3.AccessKey,
		config.Get().S3.SecretKey,
		!config.Get().S3.DisableSSL)
	if err != nil {
		log.Fatalf("could not initialize S3 client: %v", err)
	}

	if config.Get().S3.SkipSSLVerification {
		log.Debugln("disabling S3 client SSL verification ...")
		minioClient.SetCustomTransport(&http.Transport{
			Proxy: http.ProxyFromEnvironment,
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
			DialContext: (&net.Dialer{
				Timeout:   30 * time.Second,
				KeepAlive: 30 * time.Second,
			}).DialContext,
			MaxIdleConns:          100,
			IdleConnTimeout:       90 * time.Second,
			TLSHandshakeTimeout:   10 * time.Second,
			ExpectContinueTimeout: 1 * time.Second,
		})
	}

	// check if bucket exists and is accessible and if not create it, or fail
	exists, errBucketExists := minioClient.BucketExists(config.Get().S3.BucketName)
	if errBucketExists == nil && exists {
		log.Infof("S3 bucket [%s] found", config.Get().S3.BucketName)
	} else {
		if err := minioClient.MakeBucket(config.Get().S3.BucketName, ""); err != nil {
			log.Fatalf("S3 bucket [%s] could not be created: %v", config.Get().S3.BucketName, err)
			exists, errBucketExists := minioClient.BucketExists(config.Get().S3.BucketName)
			if errBucketExists != nil || exists {
				log.Fatalf("S3 bucket [%s] is not accessible: %v", config.Get().S3.BucketName, err)
			}
		} else {
			log.Infof("new S3 bucket [%s] was successfully created", config.Get().S3.BucketName)
		}
	}

	return &Client{
		Client:     minioClient,
		BucketName: config.Get().S3.BucketName,
		Endpoint:   config.Get().S3.Host,
		AccessKey:  config.Get().S3.AccessKey,
		SecretKey:  config.Get().S3.SecretKey,
	}
}
