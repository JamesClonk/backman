package health

import (
	"crypto/subtle"
	"net/http"

	echo "github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/service"
)

// Handler holds all objects and configurations used for metrics requests
type Handler struct {
}

func New() *Handler {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	g := e.Group("")

	if !config.Get().UnprotectedHealth {
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

	// setup health endpoint
	g.GET("/healthz", h.healthz)
}

func (h *Handler) healthz(c echo.Context) error {
	if len(service.GetServices("", "")) > 0 {
		return c.String(http.StatusOK, "OK")
	}
	return c.String(http.StatusInternalServerError, "No services configured")
}
