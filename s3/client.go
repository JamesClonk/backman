package s3

import (
	"crypto/tls"
	"net"
	"net/http"
	"time"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	"github.com/minio/minio-go/v6"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
)

// Client is used interact with S3 storage
type Client struct {
	Client     *minio.Client
	BucketName string
	Endpoint   string
	AccessKey  string
	SecretKey  string
}

func New(app *cfenv.App) *Client {
	// setup minio/s3 client
	var s3Service cfenv.Service
	if len(config.Get().S3.ServiceName) > 0 {
		// determine s3 service via provided service name
		s, err := app.Services.WithName(config.Get().S3.ServiceName)
		if err != nil {
			log.Fatalf("could not get s3 service [%s] from VCAP environment: %v", config.Get().S3.ServiceName, err)
		}
		s3Service = *s
	} else {
		// determine s3 service via provided service label
		s3Services, err := app.Services.WithLabel(config.Get().S3.ServiceLabel)
		if err != nil {
			log.Fatalf("could not get s3 service from VCAP environment: %v", err)
		}
		if len(s3Services) != 1 {
			log.Fatalf("there must be exactly one defined S3 service, but found %d instead", len(s3Services))
		}
		s3Service = s3Services[0]
	}

	bucketName := config.Get().S3.BucketName
	if len(bucketName) == 0 { // fallback to service binding's name
		bucketName = s3Service.Name
	}
	if len(bucketName) == 0 {
		log.Fatalln("bucket name for S3 storage is not configured properly")
	}

	endpoint, _ := s3Service.CredentialString("accessHost")
	accessKeyID, _ := s3Service.CredentialString("accessKey")
	secretAccessKey, _ := s3Service.CredentialString("sharedSecret")
	useSSL := !config.Get().S3.DisableSSL

	minioClient, err := minio.NewV4(endpoint, accessKeyID, secretAccessKey, useSSL)
	if err != nil {
		log.Fatalf("%v", err)
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
	exists, errBucketExists := minioClient.BucketExists(bucketName)
	if errBucketExists == nil && exists {
		log.Infof("S3 bucket [%s] found", bucketName)
	} else {
		if err := minioClient.MakeBucket(bucketName, ""); err != nil {
			log.Fatalf("S3 bucket [%s] could not be created: %v", bucketName, err)
			exists, errBucketExists := minioClient.BucketExists(bucketName)
			if errBucketExists != nil || exists {
				log.Fatalf("S3 bucket [%s] is not accessible: %v", bucketName, err)
			}
		} else {
			log.Infof("new S3 bucket [%s] was successfully created", bucketName)
		}
	}

	return &Client{
		Client:     minioClient,
		BucketName: bucketName,
		Endpoint:   endpoint,
		AccessKey:  accessKeyID,
		SecretKey:  secretAccessKey,
	}
}
