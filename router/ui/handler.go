package ui

import (
	"net/http"

	echo "github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service"
)

// Handler holds all objects and configurations used across Web-UI requests
type Handler struct {
	Service    *service.Service
	CFServices map[string][]service.CFService
}

type Page struct {
	Title    string
	Service  service.CFService
	Services map[string][]service.CFService
	Backups  []service.Backup
	Content  interface{}
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
		Service:    s,
		CFServices: services,
	}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	e.GET("/", h.Index)
	e.GET("/services", h.Services)
	e.GET("/backups", h.Backups)
}

func (h *Handler) Index(c echo.Context) error {
	return c.Render(http.StatusOK, "index.html", h.newPage("Home"))
}

func (h *Handler) Services(c echo.Context) error {
	return c.Render(http.StatusOK, "services.html", h.newPage("Services"))
}

func (h *Handler) Backups(c echo.Context) error {
	backups, err := h.Service.GetBackups("", "")
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}
	page := h.newPage("Backups")
	page.Backups = backups

	return c.Render(http.StatusOK, "backups.html", page)
}

func (h *Handler) newPage(title string) *Page {
	return &Page{
		Title:    title,
		Services: h.CFServices,
	}
}
