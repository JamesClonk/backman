package api

import (
	"fmt"
	"net/http"
	"net/url"

	echo "github.com/labstack/echo/v4"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/state"
)

func (h *Handler) ListStates(c echo.Context) error {
	states := state.Tracker().List()
	return c.JSON(http.StatusOK, states)
}

func (h *Handler) GetState(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName, err := url.QueryUnescape(c.Param("service_name"))
	if err != nil {
		log.Errorf("%v", err)
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid service name: %v", err))
	}

	service := h.Service.GetService(serviceType, serviceName)
	state, found := state.Tracker().Get(service)
	if !found {
		return c.JSON(http.StatusNotFound, fmt.Errorf("service state not found"))
	}
	return c.JSON(http.StatusOK, state)
}
