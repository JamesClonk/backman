package ui

import (
	"crypto/subtle"
	"net/http"
	"time"

	echo "github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service"
)

// Handler holds all objects and configurations used across Web-UI requests
type Handler struct {
	Services map[string][]config.Service
}

type Page struct {
	Title       string
	Service     config.Service
	Services    map[string][]config.Service
	AllServices map[string][]config.Service
	Backup      service.Backup
	Backups     []service.Backup
	Error       struct {
		Code    int
		Message string
		Time    time.Time
	}
}

func New() *Handler {
	services := make(map[string][]config.Service)
	for _, s := range config.Get().Services {
		// skip services without bindings, they are useless to us
		if len(s.Binding.Type) == 0 {
			continue
		}

		if _, exists := services[s.Binding.Type]; !exists {
			services[s.Binding.Type] = make([]config.Service, 0)
		}
		services[s.Binding.Type] = append(services[s.Binding.Type], s)
	}

	return &Handler{
		Services: services,
	}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	g := e.Group("")

	// secure routes with HTTP BasicAuth
	username := config.Get().Username
	password := config.Get().Password
	g.Use(middleware.BasicAuth(func(u, p string, c echo.Context) (bool, error) {
		if subtle.ConstantTimeCompare([]byte(u), []byte(username)) == 1 && subtle.ConstantTimeCompare([]byte(p), []byte(password)) == 1 {
			return true, nil
		}
		return false, nil
	}))

	g.GET("/", h.ServicesHandler)
	g.GET("/services", h.ServicesHandler)
	g.GET("/services/:service_type", h.ServicesHandler)
	g.GET("/service/:service_type/:service_name", h.ServiceHandler)

	e.HTTPErrorHandler = h.ErrorHandler
}

func (h *Handler) ErrorHandler(err error, c echo.Context) {
	code := http.StatusInternalServerError
	message := "Error"
	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
		message = he.Message.(string)
	}

	page := h.newPage("Error")
	page.Error.Code = code
	page.Error.Message = message
	page.Error.Time = time.Now()

	// dont be a chatterbox and reveal service names on the error page
	page.Services = nil
	page.AllServices = nil

	log.Errorf("%v", err)
	_ = c.Render(code, "error.html", page)
}

func (h *Handler) newPage(title string) *Page {
	return &Page{
		Title:       title,
		Services:    h.Services,
		AllServices: h.Services,
	}
}
