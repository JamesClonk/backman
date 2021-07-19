package notification_test

import (
	"testing"

	"github.com/swisscom/backman/notification"
	"github.com/swisscom/backman/service/util"
)

func TestSendNotificationBackupSucceeded(t *testing.T) {
	n := notification.Manager()
	n.Send(notification.BackupSuccess, util.Service{
		Name:                    "some-mongodb",
		Label:                   "label",
		Plan:                    "small3rs",
		Tags:                    nil,
		Timeout:                 10,
		Schedule:                "",
		Retention:               util.Retention{},
		DirectS3:                false,
		DisableColumnStatistics: false,
		ForceImport:             false,
		LocalBackupPath:         "",
		BackupOptions:           nil,
		RestoreOptions:          nil,
	}, "some-mongodb_20210714144020.gz")

	n.Send(notification.BackupFailed, util.Service{
		Name:                    "some-mongodb",
		Label:                   "label",
		Plan:                    "small3rs",
		Tags:                    nil,
		Timeout:                 10,
		Schedule:                "",
		Retention:               util.Retention{},
		DirectS3:                false,
		DisableColumnStatistics: false,
		ForceImport:             false,
		LocalBackupPath:         "",
		BackupOptions:           nil,
		RestoreOptions:          nil,
	}, "some-mongodb_20210714144020.gz")
}
