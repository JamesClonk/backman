package notifications

import (
	"testing"

	"github.com/swisscom/backman/config"
	"github.com/swisscom/backman/notifications/events"
)

func TestSendNotificationBackupSucceeded(t *testing.T) {
	n := Manager()
	n.Send(events.BackupSuccess, config.Service{
		Name: "some-mongodb",
		Binding: config.ServiceBinding{
			Type: "label",
			Plan: "small3rs",
		},
		Timeout:                 config.TimeoutDuration{10},
		Schedule:                "",
		Retention:               config.ServiceRetention{},
		DirectS3:                false,
		DisableColumnStatistics: false,
		ForceImport:             false,
		LocalBackupPath:         "",
		BackupOptions:           nil,
		RestoreOptions:          nil,
	}, "some-mongodb_20210714144020.gz")

	n.Send(events.BackupFailed, config.Service{
		Name: "some-mongodb",
		Binding: config.ServiceBinding{
			Type: "label",
			Plan: "small3rs",
		},
		Timeout:                 config.TimeoutDuration{10},
		Schedule:                "",
		Retention:               config.ServiceRetention{},
		DirectS3:                false,
		DisableColumnStatistics: false,
		ForceImport:             false,
		LocalBackupPath:         "",
		BackupOptions:           nil,
		RestoreOptions:          nil,
	}, "some-mongodb_20210714144020.gz")
}
