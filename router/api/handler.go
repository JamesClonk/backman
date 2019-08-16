package api

import (
	"fmt"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	echo "github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/s3"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service"
)

const version = "v1"

// Handler holds all objects and configurations used across API requests
type Handler struct {
	App     *cfenv.App
	S3      *s3.Client
	Service *service.Service
}

func New() *Handler {
	// read CF env
	app, err := cfenv.Current()
	if err != nil {
		log.Fatalf("%v", err)
	}

	s3 := s3.New(app)
	service := service.New(app, s3)

	// setup handler
	return &Handler{
		App:     app,
		S3:      s3,
		Service: service,
	}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	// everything should be placed under /api/$version/
	g := e.Group(fmt.Sprintf("/api/%s", version))

	g.GET("/services", h.ListServices)
	g.GET("/backups", h.ListBackups)
	g.GET("/backup/:service_type/:service_name/:file", h.GetBackup)
	g.GET("/backup/:service_type/:service_name/:file/download", h.DownloadBackup)
	g.POST("/backup/:service_type/:service_name/:file", h.CreateBackup)
	g.DELETE("/backup/:service_type/:service_name/:file", h.DeleteBackup)
}
