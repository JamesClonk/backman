package api

import (
	"fmt"
	"net/http"
	"net/url"

	"github.com/JamesClonk/backman/log"
	"github.com/JamesClonk/backman/service"
	echo "github.com/labstack/echo/v4"
)

func (h *Handler) RestoreBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName, err := url.QueryUnescape(c.Param("service_name"))
	if err != nil {
		log.Errorf("%v", err)
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid service name: %v", err))
	}
	filename, err := url.QueryUnescape(c.Param("file"))
	if err != nil {
		log.Errorf("%v", err)
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid filename: %v", err))
	}

	if !service.IsValidServiceType(serviceType) {
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
	}

	cfService := h.Service.GetService(serviceType, serviceName)
	if len(cfService.Name) == 0 {
		err := fmt.Errorf("could not find service [%s] to restore", serviceName)
		log.Errorf("%v", err)
		return c.JSON(http.StatusNotFound, err.Error())
	}

	go func() { // async
		if err := h.Service.Restore(cfService, filename); err != nil {
			log.Errorf("requested restore for service [%s] failed: %v", serviceName, err)
		}
	}()
	return c.JSON(http.StatusAccepted, nil)
}
