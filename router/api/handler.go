package api

import (
	"fmt"
	"net/http"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	echo "github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/s3"
)

const version = "v1"

// Handler holds all objects and configurations used across API requests
type Handler struct {
	App *cfenv.App
	S3  *s3.S3Client
}

func New() *Handler {
	// read CF env
	app, err := cfenv.Current()
	if err != nil {
		log.Fatalf("%v", err)
	}

	// setup handler
	return &Handler{
		App: app,
		S3:  s3.New(app),
	}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	e.GET(fmt.Sprintf("/api/%s/", version), h.HelloWorld)
	e.GET(fmt.Sprintf("/api/%s/health", version), h.Health)
	e.GET(fmt.Sprintf("/api/%s/backups", version), h.ListBackups)
}

func (h *Handler) HelloWorld(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
