package teams

import (
	"fmt"
	"sync"

	goteamsnotify "github.com/atc0005/go-teams-notify/v2"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/notifications/events"
)

var (
	teams *Teams = nil
	once  sync.Once
)

type Teams struct {
	*sync.Mutex
	api    goteamsnotify.API
	config config.TeamsNotificationConfig
}

type Color string

const (
	ColorSuccess Color = "#0eaba9" // Swisscom Turquoise
	ColorFail    Color = "#e61e64" // Swisscom Magenta
	ColorInfo    Color = "#001155" // Swisscom Navy
)

func Get(config config.NotificationConfig) *Teams {
	once.Do(func() {
		client := goteamsnotify.NewClient()
		teams = &Teams{&sync.Mutex{}, client, config.Teams}
		teams.verifyConfiguration()
	})
	return teams
}

func (t *Teams) verifyConfiguration() {
	// verify teams event types if defined
	for _, event := range t.config.Events {
		switch events.Event(event) {
		case events.BackupStarted, events.BackupSuccess, events.BackupFailed:
			continue
		default:
			log.Fatalf("invalid Teams event configuration: unrecognized event type: %s", event)
		}
	}
}

func (t *Teams) Type() string {
	return "Teams"
}

func (t *Teams) Send(event events.Event, service config.Service, filename string) error {
	// only send a notification if webhook URL was specified
	if len(t.config.Webhook) > 0 {
		log.Debugf("sending Teams notification for [%s]: %s", service.Name, event)
	} else {
		return nil
	}

	t.Lock()
	defer t.Unlock()

	if t.api == nil {
		return fmt.Errorf("Teams client is not initialized properly, %s notification will not be sent", event)
	}

	var card *goteamsnotify.MessageCard
	var err error

	if len(t.config.Events) > 0 {
		found := false
		for _, v := range t.config.Events {
			if v == string(event) {
				found = true
			}
		}

		if !found {
			log.Debugf("not sending Teams notification for %s because you decided to exclude this event", event)
			return nil
		}
	}

	switch event {
	case events.BackupStarted:
		card, err = getMessageCard(
			fmt.Sprintf("Backup of %s started", service.Name),
			fmt.Sprintf("Backman is starting to backup _%s_", service.Name),
			ColorInfo,
		)
	case events.BackupSuccess:
		card, err = getMessageCard(
			fmt.Sprintf("Backup of %s successful!", service.Name),
			fmt.Sprintf("Backman successfully completed the backup of _%s_, creating `%s`", service.Name, filename),
			ColorSuccess,
		)
	case events.BackupFailed:
		card, err = getMessageCard(
			fmt.Sprintf("Backup of %s failed!", service.Name),
			fmt.Sprintf("Backman failed to complete the backup of _%s_!", service.Name),
			ColorFail,
		)
	default:
		return fmt.Errorf("unrecongized event type: %s", event)
	}

	if err != nil {
		return err
	}
	if card == nil {
		return fmt.Errorf("card cannot be nil")
	}

	return t.api.Send(t.config.Webhook, *card)
}

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
