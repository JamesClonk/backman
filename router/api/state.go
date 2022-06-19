package api

import (
	"fmt"
	"net/http"
	"net/url"

	echo "github.com/labstack/echo/v4"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/state"
)

// swagger:route GET /api/v1/states state listStates
// Lists current/last operation state of all service types.
//
// produces:
// - application/json
//
// schemes: http, https
//
// responses:
//   200: states
func (h *Handler) ListStates(c echo.Context) error {
	states := state.Tracker().List()
	// TODO: sanitize output, make sure service_bindings are not part of it!
	return c.JSON(http.StatusOK, states)
}

// swagger:route GET /api/v1/state/{service_type}/{service_name}  state getState
// Returns current/last operation state of backup/restore.
//
// produces:
// - application/json
//
// schemes: http, https
//
// responses:
//   200: state
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
	// TODO: sanitize output, make sure service_bindings are not part of it!
	return c.JSON(http.StatusOK, state)
}
