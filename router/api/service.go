package api

import (
	"net/http"

	echo "github.com/labstack/echo/v4"
)

func (h *Handler) ListServices(c echo.Context) error {
	serviceType := c.QueryParam("service_type")
	serviceName := c.QueryParam("service_name")
	return c.JSON(http.StatusOK, h.Service.GetServices(serviceType, serviceName))
}
