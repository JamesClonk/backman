package api

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	cfenv "github.com/cloudfoundry-community/go-cfenv"
	echo "github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/util"
)

type File struct {
	Key          string
	Filepath     string
	Filename     string
	Size         int64
	LastModified time.Time
}

type Backup struct {
	ServiceType string
	ServiceName string
	Files       []File
}

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

	backups := make([]Backup, 0)
	for _, service := range services {
		objectPath := fmt.Sprintf("%s/%s/", service.Label, service.Name)
		objects, err := h.S3.ListObjects(objectPath)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}

		// collect backup files
		files := make([]File, 0)
		for _, obj := range objects {
			// exclude "directories"
			if obj.Key != objectPath && !strings.Contains(objectPath, filepath.Base(obj.Key)) {
				files = append(files, File{
					Key:          obj.Key,
					Filepath:     filepath.Dir(obj.Key),
					Filename:     filepath.Base(obj.Key),
					Size:         obj.Size,
					LastModified: obj.LastModified,
				})
			}
		}

		backups = append(backups, Backup{
			ServiceType: service.Label,
			ServiceName: service.Name,
			Files:       files,
		})
	}

	return c.JSON(http.StatusOK, backups)
}

func (h *Handler) CreateBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	filename := c.Param("file")
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)

	if !util.IsValidServiceType(serviceType) {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("unsupported service type: %s", serviceType))
	}

	// TODO: call backup background goroutine
	backup(serviceType, serviceName, filename)

	return c.JSON(http.StatusNoContent, nil)
}

func (h *Handler) DeleteBackup(c echo.Context) error {
	serviceType := c.Param("service_type")
	serviceName := c.Param("service_name")
	filename := c.Param("file")
	objectPath := fmt.Sprintf("%s/%s/%s", serviceType, serviceName, filename)

	if err := h.S3.DeleteObject(objectPath); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusNoContent, nil)
}
