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
}

func (h *Handler) Index(c echo.Context) error {
	return c.Render(http.StatusOK, "index.html", Page{Title: "all good!"})
}
