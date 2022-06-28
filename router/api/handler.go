package api

import (
	"crypto/subtle"
	"fmt"

	echo "github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/swisscom/backman/config"
)

const version = "v1"

// Handler holds all objects and configurations used across API requests
type Handler struct{}

func New() *Handler {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	// everything should be placed under /api/$version/
	g := e.Group(fmt.Sprintf("/api/%s", version))

	// don't show timestamp unless specifically configured
	format := `remote_ip="${remote_ip}", host="${host}", method=${method}, uri=${uri}, user_agent="${user_agent}", ` +
		`status=${status}, error="${error}", latency_human="${latency_human}", bytes_out=${bytes_out}` + "\n"
	if config.Get().LoggingTimestamp {
		format = `time="${time_rfc3339}", ` + format
	}
	// add logger middlerware
	g.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: format,
	}))

	// secure routes with HTTP BasicAuth
	username := config.Get().Username
	password := config.Get().Password
	g.Use(middleware.BasicAuth(func(u, p string, c echo.Context) (bool, error) {
		if subtle.ConstantTimeCompare([]byte(u), []byte(username)) == 1 && subtle.ConstantTimeCompare([]byte(p), []byte(password)) == 1 {
			return true, nil
		}
		return false, nil
	}))

	g.GET("/services", h.ListServices)
	g.GET("/backups", h.ListBackups)
	g.GET("/states", h.ListStates)

	g.GET("/service/:service_type/:service_name", h.GetService)

	g.GET("/backup/:service_type/:service_name", h.GetBackups)
	g.GET("/backup/:service_type/:service_name/:file", h.GetBackup)
	g.GET("/backup/:service_type/:service_name/:file/download", h.DownloadBackup)
	g.POST("/backup/:service_type/:service_name", h.CreateBackup)
	g.DELETE("/backup/:service_type/:service_name/:file", h.DeleteBackup)

	if !config.Get().DisableRestore {
		g.POST("/restore/:service_type/:service_name/:file", h.RestoreBackup)
		g.POST("/restore/:service_type/:service_name/:file/:target_name", h.RestoreBackup)
	}

	g.GET("/state/:service_type/:service_name", h.GetState)
}
