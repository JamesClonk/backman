package api

import (
	"fmt"
	"net/http"

	echo "github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/util"
)

func (h *Handler) ListBackups(c echo.Context) error {
	// get list of services to display backups for
	serviceType := c.QueryParam("service_type")
	serviceName := c.QueryParam("service_name")

	backups, err := h.Service.GetBackups(serviceType, serviceName)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}
	return c.JSON(http.StatusOK, backups)
}

func (h *Handler) CreateBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	filename := c.Param("file")

	if !util.IsValidServiceType(serviceType) {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
	}

	if err := h.Service.Backup(serviceType, serviceName, filename); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusAccepted, nil)
}

func (h *Handler) DeleteBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	filename := c.Param("file")

	if err := h.Service.DeleteBackup(serviceType, serviceName, filename); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusNoContent, nil)
}
