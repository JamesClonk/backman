package api

import (
	"fmt"
	"net/http"
	"net/url"

	echo "github.com/labstack/echo/v4"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service"
)

// swagger:route POST /api/v1/restore/{service_type}/{service_name}/{filename} restore restoreBackup
// Triggers a restore for given service.
//
// produces:
// - application/json
//
// schemes: http, https
//
// responses:
//   202: service
func (h *Handler) RestoreBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName, err := url.QueryUnescape(c.Param("service_name"))
	if err != nil {
		log.Errorf("%v", err)
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid service name: %v", err))
	}
	targetName, err := url.QueryUnescape(c.Param("target_name"))
	if err != nil {
		log.Errorf("%v", err)
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid target service name: %v", err))
	}
	filename, err := url.QueryUnescape(c.Param("file"))
	if err != nil {
		log.Errorf("%v", err)
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid filename: %v", err))
	}

	if !config.IsValidServiceType(serviceType) {
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
	}

	serviceInstance := service.GetService(serviceType, serviceName)
	if len(serviceInstance.Name) == 0 {
		err := fmt.Errorf("could not find service [%s] to restore", serviceName)
		log.Errorf("%v", err)
		return c.JSON(http.StatusNotFound, err.Error())
	}

	targetService := config.Service{}
	if len(targetName) > 0 {
		targetService = service.GetService(serviceType, targetName)
		if len(targetService.Name) == 0 {
			err := fmt.Errorf("could not find target service [%s] to restore", targetName)
			log.Errorf("%v", err)
			return c.JSON(http.StatusNotFound, err.Error())
		}
	} else {
		targetService = serviceInstance
	}

	go func() { // async
		if err := service.RestoreBackup(serviceInstance, targetService, filename); err != nil {
			log.Errorf("requested restore for service [%s] failed: %v", serviceName, err)
		}
	}()
	if len(targetService.Name) > 0 {
		return c.JSON(http.StatusAccepted, targetService)
	}
	return c.JSON(http.StatusAccepted, serviceInstance)
}
