package notification

import (
	"fmt"
	goteamsnotify "github.com/atc0005/go-teams-notify/v2"
)

type Color string

const (
	ColorSuccess Color = "#0eaba9" // Swisscom Turquoise
	ColorFail    Color = "#e61e64" // Swisscom Magenta
	ColorInfo    Color = "#001155" // Swisscom Navy
)

func getMessageCard(title string, text string, color Color) (*goteamsnotify.MessageCard, error) {
	messageCard := goteamsnotify.NewMessageCard()
	messageCard.Title = title
	messageCard.ThemeColor = string(color)
	section := goteamsnotify.NewMessageCardSection()
	section.Text = text
	err := messageCard.AddSection(section)
	if err != nil {
		return nil, fmt.Errorf("unable to add section: %v", err)
	}
	messageCard.Summary = section.Text
	return &messageCard, nil
}
