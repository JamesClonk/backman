package api

import (
	"net/http"

	echo "github.com/labstack/echo/v4"
)

func (h *Handler) Health(c echo.Context) error {
	return c.JSON(http.StatusOK, struct {
		Status string `json:"status"`
	}{"ok"})
}
