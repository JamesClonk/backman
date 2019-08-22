package ui

import (
	"net/http"

	echo "github.com/labstack/echo/v4"
)

// Handler holds all objects and configurations used across Web-UI requests
type Handler struct{}

type Page struct {
	Title   string
	Content interface{}
}

func New() *Handler {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	e.GET("/", h.Index)
	e.GET("/services", h.Services)
	e.GET("/backups", h.Backups)
}

func (h *Handler) Index(c echo.Context) error {
	return c.Render(http.StatusOK, "index.html", Page{Title: "all good!"})
}

func (h *Handler) Services(c echo.Context) error {
	return c.Render(http.StatusOK, "services.html", Page{Title: "all good!"})
}

func (h *Handler) Backups(c echo.Context) error {
	return c.Render(http.StatusOK, "backups.html", Page{Title: "all good!"})
}
