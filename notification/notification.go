package notification

import (
	"fmt"
	"sync"

	goteamsnotify "github.com/atc0005/go-teams-notify/v2"
	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/log"
	"github.com/swisscom/backman/service/util"
)

var (
	notificationService *Service
	once                sync.Once
)

type Service struct {
	config config.NotificationConfig

	teamsApi *goteamsnotify.API
}

func (s Service) Send(event Event, service util.Service, filename string) {
	if len(s.config.Teams.Webhook) > 0 {
		log.Debugf("sending Teams notification for [%s]: %s", service.Name, event)
		err := s.sendTeamsNotification(event, service, filename)
		if err != nil {
			log.Errorf("unable to send Teams notification: %v", err)
		}
	}
}

func (s Service) sendTeamsNotification(event Event, service util.Service, filename string) error {
	if s.teamsApi == nil {
		return fmt.Errorf("Teams client is not initialized properly, %s notification will not be sent", event)
	}
	teamsClient := *s.teamsApi
	var card *goteamsnotify.MessageCard
	var err error

	if len(s.config.Teams.Events) > 0 {
		found := false
		for _, v := range s.config.Teams.Events {
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
	case BackupStarted:
		card, err = getMessageCard(
			fmt.Sprintf("Backup of %s started", service.Name),
			fmt.Sprintf("Backman is starting to backup _%s_", service.Name),
			ColorInfo,
		)
	case BackupSuccess:
		card, err = getMessageCard(
			fmt.Sprintf("Backup of %s successful!", service.Name),
			fmt.Sprintf("Backman successfully completed the backup of _%s_, creating `%s`", service.Name, filename),
			ColorSuccess,
		)
	case BackupFailed:
		card, err = getMessageCard(
			fmt.Sprintf("Backup of %s failed!", service.Name),
			fmt.Sprintf("Backman failed to complete the backup of _%s_!", service.Name),
			ColorFail,
		)
	default:
		return fmt.Errorf("unrecongized event: %s", event)
	}

	if err != nil {
		return err
	}

	if card == nil {
		return fmt.Errorf("card cannot be nil")
	}

	return teamsClient.Send(s.config.Teams.Webhook, *card)
}

func (s *Service) initializeTeams() {
	client := goteamsnotify.NewClient()
	s.teamsApi = &client
}

func newNotificationService(config *config.Config) *Service {
	return &Service{config: config.Notifications}
}

func Manager() *Service {
	once.Do(func() {
		notificationService = newNotificationService(config.Get())
		notificationService.initializeTeams()
	})
	return notificationService
}
