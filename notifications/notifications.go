package notifications

import (
	"sync"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/notifications/events"
	"github.com/swisscom/backman/notifications/teams"
	"github.com/swisscom/backman/service/util"
)

var (
	notificationService *NotificationService
	once                sync.Once
)

type NotificationService struct {
	notifiers []Notifier
}

type Notifier interface {
	Send(events.Event, util.Service, string) error
	Type() string
}

func (n NotificationService) Send(event events.Event, service util.Service, filename string) {
	for _, notifier := range n.notifiers {
		if err := notifier.Send(event, service, filename); err != nil {
			log.Errorf("unable to send %s notification: %v", notifier.Type(), err)
		}
	}
}

func newNotificationService(config *config.Config) *NotificationService {
	notifiers := make([]Notifier, 0)

	//notifiers = append(notifiers, slack.Get(config.Notifications))
	notifiers = append(notifiers, teams.Get(config.Notifications))
	//notifiers = append(notifiers, discord.Get(config.Notifications))

	return &NotificationService{
		notifiers: notifiers,
	}
}

func Manager() *NotificationService {
	once.Do(func() {
		notificationService = newNotificationService(config.Get())
	})
	return notificationService
}
