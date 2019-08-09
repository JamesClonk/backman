package s3

import (
	cfenv "github.com/cloudfoundry-community/go-cfenv"
	minio "github.com/minio/minio-go/v6"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/env"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
)

// S3Client is used interact with S3 storage
type S3Client struct {
	Client     *minio.Client
	BucketName string
}

func New(app *cfenv.App) *S3Client {
	// read env
	s3ServiceLabel := env.Get("S3_SERVICE_LABEL", "dynstrg")

	// setup minio/s3 client
	s3Services, err := app.Services.WithLabel(s3ServiceLabel)
	if err != nil {
		log.Fatalf("could not get s3 service from VCAP environment: %v", err)
	}
	if len(s3Services) != 1 {
		log.Fatalf("there must be exactly one defined S3 service, but found %d instead", len(s3Services))

	}
	bucketName := env.Get("S3_BUCKET_NAME", s3Services[0].Name)
	if len(bucketName) == 0 {
		log.Fatalln("bucket name for S3 storage is not configured properly")
	}
	endpoint, _ := s3Services[0].CredentialString("accessHost")
	accessKeyID, _ := s3Services[0].CredentialString("accessKey")
	secretAccessKey, _ := s3Services[0].CredentialString("sharedSecret")
	useSSL := true

	minioClient, err := minio.New(endpoint, accessKeyID, secretAccessKey, useSSL)
	if err != nil {
		log.Fatalf("%v", err)
	}
	return &S3Client{
		Client:     minioClient,
		BucketName: bucketName,
	}
}
