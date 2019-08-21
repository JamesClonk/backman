package api

import (
	"fmt"
	"net/http"

	echo "github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service"
)

func (h *Handler) ListServices(c echo.Context) error {
	serviceType := c.QueryParam("service_type")
	serviceName := c.QueryParam("service_name")
	return c.JSON(http.StatusOK, h.Service.GetServices(serviceType, serviceName))
}

func (h *Handler) ListBackups(c echo.Context) error {
	serviceType := c.QueryParam("service_type")
	serviceName := c.QueryParam("service_name")

	backups, err := h.Service.GetBackups(serviceType, serviceName)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}
	return c.JSON(http.StatusOK, backups)
}

func (h *Handler) GetBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	filename := c.Param("file")

	backup, err := h.Service.GetBackup(serviceType, serviceName, filename)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}
	if len(backup.Files) == 0 || len(backup.Files[0].Filename) == 0 {
		return echo.NewHTTPError(http.StatusNotFound, fmt.Errorf("file not found"))
	}
	return c.JSON(http.StatusOK, backup)
}

func (h *Handler) CreateBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	filename := c.Param("file")

	if !service.IsValidServiceType(serviceType) {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
	}

	cfService := h.Service.GetService(serviceType, serviceName)
	if len(cfService.Name) == 0 {
		err := fmt.Errorf("could not find service [%s] to backup", serviceName)
		log.Errorf("%v", err)
		return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("%v", err))
	}

	go func() { // async
		if err := h.Service.Backup(cfService, filename); err != nil {
			log.Errorf("requested backup for service [%s] failed: %v", serviceName, err)
		}
	}()
	return c.JSON(http.StatusAccepted, nil)
}

func (h *Handler) DownloadBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	filename := c.Param("file")

	reader, err := h.Service.ReadBackup(serviceType, serviceName, filename)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	c.Response().Header().Set(echo.HeaderContentDisposition, fmt.Sprintf(`attachment; filename="%s"`, filename))
	return c.Stream(http.StatusOK, "application/gzip", reader)
}

func (h *Handler) DeleteBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	filename := c.Param("file")

	if err := h.Service.DeleteBackup(serviceType, serviceName, filename); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}
