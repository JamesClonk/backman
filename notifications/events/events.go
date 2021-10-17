package events

type Event string

const (
	BackupStarted Event = "backup-started"
	BackupSuccess Event = "backup-success"
	BackupFailed  Event = "backup-failed"
)
