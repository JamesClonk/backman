package notification

type Event string

const (
	BackupStarted    Event = "backup-started"
	BackupSuccessful Event = "backup-success"
	BackupFailed     Event = "backup-fail"
)
