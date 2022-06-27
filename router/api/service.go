package api

import (
	"fmt"
	"net/http"
	"net/url"
	"time"

	echo "github.com/labstack/echo/v4"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service"
)

// swagger:response service
type Service struct {
	Name      string        `json:"Name"`
	Type      string        `json:"Type"`
	Provider  string        `json:"Provider,omitempty"`
	Plan      string        `json:"Plan,omitempty"`
	Timeout   time.Duration `json:"Timeout"`
	Schedule  string        `json:"Schedule"`
	Retention Retention     `json:"Retention"`
}
type Retention struct {
	Days  int `json:"Days"`
	Files int `json:"Files"`
}

// swagger:response services
type Services []Service

func getAPIService(service config.Service) Service {
	return Service{
		Name:     service.Name,
		Type:     service.Binding.Type,
		Provider: service.Binding.Provider,
		Plan:     service.Binding.Plan,
		Timeout:  service.Timeout.Duration,
		Schedule: service.Schedule,
		Retention: Retention{
			Days:  service.Retention.Days,
			Files: service.Retention.Files,
		},
	}
}

// swagger:route GET /api/v1/services service listServices
// Lists all services managed by backman.
//
// produces:
// - application/json
//
// schemes: http, https
//
// responses:
//   200: services
func (h *Handler) ListServices(c echo.Context) error {
	serviceType := c.QueryParam("service_type")
	serviceName, err := url.QueryUnescape(c.Param("service_name"))
	if err != nil {
		log.Errorf("%v", err)
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid service name: %v", err))
	}

	services := make(Services, 0)
	for _, service := range service.GetServices(serviceType, serviceName) {
		services = append(services, getAPIService(service))
	}
	return c.JSON(http.StatusOK, services)
}
