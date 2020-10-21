package metrics

import (
	"crypto/subtle"

	echo "github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/swisscom/backman/config"
)

// Handler holds all objects and configurations used for metrics requests
type Handler struct {
}

func New() *Handler {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	g := e.Group("")

	if !config.Get().UnprotectedMetrics {
		// secure routes with HTTP BasicAuth
		username := config.Get().Username
		password := config.Get().Password
		g.Use(middleware.BasicAuth(func(u, p string, c echo.Context) (bool, error) {
			if subtle.ConstantTimeCompare([]byte(u), []byte(username)) == 1 && subtle.ConstantTimeCompare([]byte(p), []byte(password)) == 1 {
				return true, nil
			}
			return false, nil
		}))
	}

	// setup Prometheus endpoint
	g.GET("/metrics", echo.WrapHandler(promhttp.Handler()))
}
