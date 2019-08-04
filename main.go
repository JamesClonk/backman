package main

import (
	"crypto/subtle"
	"fmt"
	"net/http"
	"time"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	minio "github.com/minio/minio-go/v6"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/env"
)

// Handler holds all objects and configurations used across requests
type Handler struct {
	App *cfenv.App
	S3  *S3Client
}

// S3Client is used interact with S3 storage
type S3Client struct {
	Client     *minio.Client
	BucketName string
}

func main() {
	// read env
	username := env.MustGet("USERNAME")
	password := env.MustGet("PASSWORD")
	s3ServiceLabel := env.Get("S3_SERVICE_LABEL", "dynstrg")

	// setup basic echo configuration
	e := echo.New()
	e.DisableHTTP2 = true
	e.HideBanner = true
	e.HidePort = true
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.Secure())
	e.Use(middleware.Logger())
	//e.Use(middleware.Recover()) // don't recover, let platform deal with panics
	e.Use(middleware.Static("/static"))

	// secure whole app with HTTP BasicAuth
	e.Use(middleware.BasicAuth(func(u, p string, c echo.Context) (bool, error) {
		if subtle.ConstantTimeCompare([]byte(u), []byte(username)) == 1 && subtle.ConstantTimeCompare([]byte(p), []byte(password)) == 1 {
			return true, nil
		}
		return false, nil
	}))

	// read CF env
	app, err := cfenv.Current()
	if err != nil {
		e.Logger.Fatal(err)
	}

	// setup minio/s3 client
	s3Services, err := app.Services.WithLabel(s3ServiceLabel)
	if err != nil {
		e.Logger.Fatalf("could not get s3 service from VCAP environment: %v", err)
	}
	if len(s3Services) != 1 {
		e.Logger.Fatalf("there must be exactly one defined S3 service, but found %d instead", len(s3Services))
	}
	bucketName := env.Get("S3_BUCKET_NAME", s3Services[0].Name)
	if len(bucketName) == 0 {
		e.Logger.Fatalf("bucket name for S3 storage is not configured properly")
	}
	endpoint, _ := s3Services[0].CredentialString("accessHost")
	accessKeyID, _ := s3Services[0].CredentialString("accessKey")
	secretAccessKey, _ := s3Services[0].CredentialString("sharedSecret")
	useSSL := true
	minioClient, err := minio.New(endpoint, accessKeyID, secretAccessKey, useSSL)
	if err != nil {
		e.Logger.Fatal(err)
	}

	// setup handler
	h := Handler{
		App: app,
		S3: &S3Client{
			Client:     minioClient,
			BucketName: bucketName,
		},
	}

	// setup routes
	e.GET("/", h.hello)
	e.GET("/health", h.health)
	e.GET("/backups", h.listBackups)
	e.GET("/backups/:serviceType", h.listBackups)
	e.GET("/backups/:serviceType/:serviceName", h.listBackups)

	// start
	e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", h.App.Port)))
}

func (h *Handler) hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}

func (h *Handler) health(c echo.Context) error {
	return c.JSON(http.StatusOK, struct {
		Status string `json:"status"`
	}{"ok"})
}

func (h *Handler) listBackups(c echo.Context) error {
	var services []cfenv.Service

	// get list of services to display backups for
	serviceType := c.Param("serviceType")
	serviceName := c.Param("serviceName")
	if len(serviceType) > 0 {
		if len(serviceName) > 0 {
			// list backups only for a specific service binding
			service, err := h.App.Services.WithName(serviceName)
			if err != nil {
				return echo.NewHTTPError(http.StatusNotFound, err.Error())
			}
			services = append(services, *service)
		} else {
			// list backups only for a specific service type
			var err error
			services, err = h.App.Services.WithLabel(serviceType)
			if err != nil {
				return echo.NewHTTPError(http.StatusNotFound, err.Error())
			}
		}
	} else {
		// list backups for all services
		for label, s := range h.App.Services {
			if isValidServiceType(label) {
				services = append(services, s...)
			}
		}
	}

	// TODO: collect backups on S3 for services here
	type File struct {
		Name      string
		Size      int64
		Timestamp time.Time
	}
	type Backup struct {
		ServiceType string
		ServiceName string
		Files       []File
	}
	backups := make([]Backup, 0)
	for _, service := range services {
		backups = append(backups, Backup{
			ServiceType: service.Label,
			ServiceName: service.Name,
			Files: []File{
				File{
					Name:      "demo1.txt",
					Size:      43256,
					Timestamp: time.Now(),
				},
				File{
					Name:      "demo2.log",
					Size:      120230,
					Timestamp: time.Now().AddDate(0, -1, -100),
				},
				File{
					Name:      "db-dump.tar.gz",
					Size:      68843256,
					Timestamp: time.Now().AddDate(-1, -1, -1),
				},
			},
		})
	}

	return c.JSON(http.StatusOK, backups)
}

func isValidServiceType(serviceType string) bool {
	switch serviceType {
	case "postgres":
		return true
	case "mariadb":
		return true
	case "mysql":
		return true
	case "mongodb":
		return true
	}
	return false
}
