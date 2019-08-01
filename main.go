package main

import (
	"crypto/subtle"
	"fmt"
	"net/http"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/env"
)

func main() {
	// read env
	username := env.MustGet("USERNAME")
	password := env.MustGet("PASSWORD")

	// setup echo
	e := echo.New()
	e.Use(middleware.Secure())
	e.Use(middleware.Logger())
	//e.Use(middleware.Recover())
	e.Use(middleware.Static("/static"))

	// read CF env
	cf, err := cfenv.Current()
	if err != nil {
		e.Logger.Fatal(err)
	}

	// secure whole app with HTTP BasicAuth
	e.Use(middleware.BasicAuth(func(u, p string, c echo.Context) (bool, error) {
		if subtle.ConstantTimeCompare([]byte(u), []byte(username)) == 1 && subtle.ConstantTimeCompare([]byte(p), []byte(password)) == 1 {
			return true, nil
		}
		return false, nil
	}))

	// routes
	e.GET("/", hello)

	// start
	e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", cf.Port)))
}

func hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
