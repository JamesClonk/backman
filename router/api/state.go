package api

import (
	"fmt"
	"net/http"
	"net/url"
	"time"

	echo "github.com/labstack/echo/v4"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service"
	"github.com/swisscom/backman/state"
)

// swagger:model State
type State struct {
	Service   Service       `json:"Service,omitempty"`
	Operation string        `json:"Operation,omitempty"`
	Status    string        `json:"Status,omitempty"`
	Filename  string        `json:"Filename,omitempty"`
	At        time.Time     `json:"At,omitempty"`
	Duration  time.Duration `json:"Duration,omitempty"`
}

// swagger:response States
type States []State

func getAPIState(state state.State) State {
	return State{
		Service:   getAPIService(state.Service),
		Operation: state.Operation,
		Status:    state.Status,
		Filename:  state.Filename,
		At:        state.At,
		Duration:  state.Duration,
	}
}

// swagger:route GET /api/v1/states state listStates
// Lists current/last operation state of all service types.
//
// produces:
// - application/json
//
// schemes: http, https
//
// responses:
//   200: States
func (h *Handler) ListStates(c echo.Context) error {
	states := make(States, 0)
	for _, state := range state.Tracker().List() {
		states = append(states, getAPIState(state))
	}
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
//   200: State
func (h *Handler) GetState(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName, err := url.QueryUnescape(c.Param("service_name"))
	if err != nil {
		log.Errorf("%v", err)
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid service name: %v", err))
	}

	serviceInstance := service.GetService(serviceType, serviceName)
	state, found := state.Tracker().Get(serviceInstance)
	if !found {
		return c.JSON(http.StatusNotFound, fmt.Errorf("service state not found"))
	}
	return c.JSON(http.StatusOK, getAPIState(state))
}
