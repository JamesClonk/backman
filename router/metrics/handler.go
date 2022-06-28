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

	if !config.Get().DisableMetricsLogging {
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
	}

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
