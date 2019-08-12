package router

import (
	"crypto/subtle"
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/env"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/router/api"
)

type Router struct {
	echo *echo.Echo
	api  *api.Handler
}

func New() *Router {
	// read env
	username := env.MustGet("USERNAME")
	password := env.MustGet("PASSWORD")

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

	// setup router
	r := &Router{
		echo: e,
		api:  api.New(),
	}
	// setup API routes
	r.api.RegisterRoutes(r.echo)

	return r
}

func (r *Router) Start() error {
	return r.echo.Start(fmt.Sprintf(":%d", r.api.App.Port))
}
