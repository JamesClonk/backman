package api

import (
	"fmt"
	"net/http"

	echo "github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/log"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service"
)

func (h *Handler) RestoreBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	filename := c.Param("file")

	if !service.IsValidServiceType(serviceType) {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
	}

	cfService := h.Service.GetService(serviceType, serviceName)
	if len(cfService.Name) == 0 {
		err := fmt.Errorf("could not find service [%s] to restore", serviceName)
		log.Errorf("%v", err)
		return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("%v", err))
	}

	go func() { // async
		if err := h.Service.Restore(cfService, filename); err != nil {
			log.Errorf("requested restore for service [%s] failed: %v", serviceName, err)
		}
	}()
	return c.JSON(http.StatusAccepted, nil)
}
