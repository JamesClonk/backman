package ui

import (
	"io"
	"strings"
	"text/template"

	"github.com/dustin/go-humanize"
	"github.com/hako/durafmt"
	"github.com/labstack/echo/v4"
	"gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app/service"
)

type TemplateRenderer struct {
	templates *template.Template
}

func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func (h *Handler) RegisterRenderer(e *echo.Echo) {
	funcMap := template.FuncMap{
		"ToLower":     strings.ToLower,
		"ServiceType": service.ParseServiceType,
		"Duration":    durafmt.Parse,
		"Bytes":       func(b int64) string { return humanize.Bytes(uint64(b)) },
		"Time":        humanize.Time,
	}
	renderer := &TemplateRenderer{
		templates: template.Must(template.New("main").Funcs(funcMap).ParseGlob("public/*.html")),
	}
	e.Renderer = renderer
}
