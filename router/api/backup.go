package api

import (
	"net/http"
	"time"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	echo "github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/util"
)

func (h *Handler) ListBackups(c echo.Context) error {
	var services []cfenv.Service

	// get list of services to display backups for
	serviceType := c.QueryParam("service_type")
	serviceName := c.QueryParam("service_name")
	if len(serviceName) > 0 {
		// list backups only for a specific service binding
		service, err := h.App.Services.WithName(serviceName)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		services = append(services, *service)
	} else if len(serviceType) > 0 {
		// list backups only for a specific service type
		var err error
		services, err = h.App.Services.WithLabel(serviceType)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
	} else {
		// list backups for all services
		for label, s := range h.App.Services {
			if util.IsValidServiceType(label) {
				services = append(services, s...)
			}
		}
	}

	// TODO: collect backups on S3 for services here
	type File struct {
		Name      string
		Size      int64
		Timestamp time.Time
	}
	type Backup struct {
		ServiceType string
		ServiceName string
		Files       []File
	}
	backups := make([]Backup, 0)
	for _, service := range services {
		backups = append(backups, Backup{
			ServiceType: service.Label,
			ServiceName: service.Name,
			Files: []File{
				File{
					Name:      "demo1.txt",
					Size:      43256,
					Timestamp: time.Now(),
				},
				File{
					Name:      "demo2.log",
					Size:      120230,
					Timestamp: time.Now().AddDate(0, -1, -100),
				},
				File{
					Name:      "db-dump.tar.gz",
					Size:      68843256,
					Timestamp: time.Now().AddDate(-1, -1, -1),
				},
			},
		})
	}

	return c.JSON(http.StatusOK, backups)
}
