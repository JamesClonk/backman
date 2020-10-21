package router

import (
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/router/api"
	"github.com/swisscom/backman/router/metrics"
	"github.com/swisscom/backman/router/ui"
)

type Router struct {
	echo    *echo.Echo
	metrics *metrics.Handler
	api     *api.Handler
	ui      *ui.Handler
}

func New() *Router {
	// setup basic echo configuration
	e := echo.New()
	e.DisableHTTP2 = true
	e.HideBanner = true
	e.HidePort = true

	// middlewares
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.Secure())

	// don't show timestamp unless specifically configured
	format := `remote_ip="${remote_ip}", host="${host}", method=${method}, uri=${uri}, user_agent="${user_agent}", ` +
		`status=${status}, error="${error}", latency_human="${latency_human}", bytes_out=${bytes_out}` + "\n"
	if config.Get().LoggingTimestamp {
		format = `time="${time_rfc3339}", ` + format
	}
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: format,
	}))

	//e.Use(middleware.Recover()) // don't recover, let platform deal with panics
	e.Use(middleware.Static("static"))

	// setup router
	r := &Router{
		echo:    e,
		metrics: metrics.New(),
		api:     api.New(),
		ui:      ui.New(),
	}

	if !config.Get().DisableMetrics {
		// setup metrics route
		r.metrics.RegisterRoutes(r.echo)
	}

	if !config.Get().DisableWeb {
		// setup API routes
		r.api.RegisterRoutes(r.echo)
		// setup Web-UI routes
		r.ui.RegisterRoutes(r.echo)
		// setup Web-UI rendering
		r.ui.RegisterRenderer(r.echo)
	}

	return r
}

func (r *Router) Start() error {
	return r.echo.Start(fmt.Sprintf(":%d", r.api.App.Port))
}
