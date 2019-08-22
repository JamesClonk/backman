package ui

import (
	"fmt"
	"net/http"
	"time"

	echo "github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service"
)

// Handler holds all objects and configurations used across Web-UI requests
type Handler struct {
	Service  *service.Service
	Services map[string][]service.CFService
}

type Page struct {
	Title    string
	Service  service.CFService
	Services map[string][]service.CFService
	Backups  []service.Backup
	Content  interface{}
	Error    struct {
		Code    int
		Message string
		Time    time.Time
	}
}

func New() *Handler {
	s := service.Get()

	services := make(map[string][]service.CFService)
	for _, s := range s.Services {
		if _, exists := services[s.Label]; !exists {
			services[s.Label] = make([]service.CFService, 0)
		}
		services[s.Label] = append(services[s.Label], s)
	}

	return &Handler{
		Service:  s,
		Services: services,
	}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	e.GET("/", h.Index)
	e.GET("/services", h.ServicesHandler)
	e.GET("/services/:service_type", h.ServicesHandler)
	e.GET("/service/:service_type/:service_name", h.ServiceHandler)

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

	c.Logger().Error(err)
	c.Render(http.StatusOK, "error.html", page)
}

func (h *Handler) Index(c echo.Context) error {
	return c.Render(http.StatusOK, "index.html", h.newPage("Home"))
}

func (h *Handler) ServicesHandler(c echo.Context) error {
	page := h.newPage("Services")

	serviceType := c.Param("service_type")
	if len(serviceType) > 0 {
		if !service.IsValidServiceType(serviceType) {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
		}

		page.Services = make(map[string][]service.CFService)
		page.Services[serviceType] = h.Services[serviceType]
		page.Service.Label = serviceType
	}

	return c.Render(http.StatusOK, "services.html", page)
}

func (h *Handler) ServiceHandler(c echo.Context) error {
	page := h.newPage("Services")

	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	if len(serviceType) == 0 || len(serviceName) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request")
	}

	if !service.IsValidServiceType(serviceType) {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
	}

	for _, service := range h.Services[serviceType] {
		if service.Name == serviceName {
			page.Service = service
			break
		}
	}
	if len(page.Service.Name) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("could not find service: %s", serviceName))
	}

	return c.Render(http.StatusOK, "service.html", page)
}

func (h *Handler) newPage(title string) *Page {
	return &Page{
		Title:    title,
		Services: h.Services,
	}
}
