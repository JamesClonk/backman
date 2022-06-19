package ui

import (
	"fmt"
	"net/http"
	"net/url"
	"sort"

	echo "github.com/labstack/echo/v4"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
)

func (h *Handler) ServicesHandler(c echo.Context) error {
	page := h.newPage("Services")

	serviceType := c.Param("service_type")
	if len(serviceType) > 0 {
		if !config.IsValidServiceType(serviceType) {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
		}

		// reduce services list to specific type only
		page.Services = make(map[string][]config.Service)
		page.Services[serviceType] = page.AllServices[serviceType]
		page.Service.Label = serviceType
		page.Title = config.ParseServiceType(serviceType).String()
	}

	return c.Render(http.StatusOK, "services.html", page)
}

func (h *Handler) ServiceHandler(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName, err := url.QueryUnescape(c.Param("service_name"))
	if err != nil {
		log.Errorf("%v", err)
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("invalid service name: %v", err))
	}

	if len(serviceType) == 0 || len(serviceName) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request - service_type and service_name are required!")
	}

	if !config.IsValidServiceType(serviceType) {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
	}

	page := h.newPage(serviceName)
	for _, service := range h.Services[serviceType] {
		if service.Name == serviceName {
			page.Service = service
			break
		}
	}
	if len(page.Service.Name) == 0 {
		return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("could not find service: %s", serviceName))
	}

	// get backups for service
	backups, err := h.Service.GetBackups(serviceType, serviceName)
	if err != nil {
		log.Errorf("%v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("could not read service backups from S3: %v", err))
	}
	page.Backups = backups

	// there should only be 1 backup struct in there since we specified serviceName
	if len(page.Backups) != 1 {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("found more than one backup listing for service: %v", serviceName))
	}
	page.Backup = page.Backups[0]

	// reverse sort order of backup files
	sort.Slice(page.Backup.Files, func(i, j int) bool {
		return page.Backup.Files[j].LastModified.Before(page.Backup.Files[i].LastModified)
	})

	return c.Render(http.StatusOK, "service.html", page)
}
