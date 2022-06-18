# Configuration

backman can be configured via JSON configuration, either with a file `config.json` in its root directory, or by the environment variable `BACKMAN_CONFIG`.
Values configured in `BACKMAN_CONFIG` take precedence over `config.json`.
By default backman will assume useful values for all services/backups unless configured otherwise.

**Note:** Configuration via the `config.json` only makes sense when either pushing with buildpacks to CF, or by building your own docker image.
If you are using the provided docker image `jamesclonk/backman` (as is default in the manifest) then there will be no configuration file and all configuration options need to be set via environment variables.

It is generally recommended to use the `BACKMAN_CONFIG` environment variable for all your configuration needs.

These here are the default values backman will use if not configured via JSON:
```json
{
	"log_level": "info",
	"logging_timestamp": false,
	"disable_web": false,
	"disable_metrics": false,
	"disable_restore": false,
	"unprotected_metrics": false,
	"notifications": {
		"teams": {
			"webhook": "https://example.webhook.office.com/webhookb2/deadbeef/IncomingWebhook/beefdead/deadbeef",
			"events": ["backup-success", "backup-failed"]
		}
	},
	"s3": {
		"service_label": "dynstrg",
		"encryption_key":"a_super_strong_key"
	},
	"services": {
		...
		"<service-instance-name>": {
			"schedule": "<random-second> <random-minute> <random-hour> * * *",
			"timeout": "1h",
			"retention": {
				"days": 31,
				"files": 100
			}
		}
		...
	}
}
```

backman can be secured through HTTP basic auth, with username and password provided either in the JSON configuration
```json
{
	"username": "http_basic_auth_user_abc",
	"password": "http_basic_auth_password_xyz"
}
```
or through the specific environment variables `BACKMAN_USERNAME` and `BACKMAN_PASSWORD` (see `manifest.yml`)

Possible JSON properties:
- `log_level`: optional, specifies log output level, can be *info*, *warn*, *debug*, *error*
- `logging_timestamp`: optional, enable timestamping log output, not needed when deployed on Cloud Foundry
- `username`: optional, HTTP basic auth username
- `password`: optional, HTTP basic auth password
- `disable_web`: optional, disable web interface and api
- `disable_metrics`: optional, disable Prometheus metrics endpoint
- `disable_restore`: optional, disable restore function on API and web. It can be used to mitigate damage in case backman credentials are leaked. Enable it just before you might need to restore.
- `unprotected_metrics`: optional, disable HTTP basic auth protection for Prometheus metrics endpoint
- `notifications.teams.webhook`: optional, setting a webhook URL will enable MS Teams notifications about backups
- `notifications.teams.events`: optional, list of events to send a Teams notification for. Can be *backup-started*, *backup-success*, *backup-failed*. Sends a notification for all events if empty.
- `s3.disable_ssl`: optional, S3 client connections will use HTTP instead of HTTPS
- `s3.skip_ssl_verification`: optional, S3 client will still use HTTPS but skips certificate verification
- `s3.service_label`: optional, defines which service label backman will look for to find the S3-compatible object storage
- `s3.bucket_name`: optional, bucket to use on S3 storage, backman will use service-instance/binding-name if not configured
- `s3.encryption_key`: optional, defines the key which will be used to encrypt and decrypt backups as they are stored on the S3 can also be passed as an environment variable with the name `BACKMAN_ENCRYPTION_KEY`
- `services.<service-instance>.schedule`: optional, defines cron schedule for running backups
- `services.<service-instance>.timeout`: optional, backman will abort a running backup/restore if timeout is exceeded
- `services.<service-instance>.retention.days`: optional, specifies how long backman will keep backups on S3 at maximum for this service instance
- `services.<service-instance>.retention.files`: optional, specifies how maximum number of files backman will keep on S3 for this service instance
- `services.<service-instance>.direct_s3`: optional / Elasticsearch-specific, bypasses backman internal backup stream and encryption entirely, streaming directly from/to S3 via elasticdump
- `services.<service-instance>.disable_column_statistics`: optional / MySQL-specific, allows for disabling export of column statistics. Set to `true` to avoid issues with pre-8.0 versions of MySQL
- `services.<service-instance>.force_import`: optional / MySQL-specific. Set to `true` to use the `--force` flag for mysql, ignoring any errors that might occur while importing backups
- `services.<service-instance>.log_stderr`: optional. Outputs stderr of backup process to stdout in case of errors or timeouts
- `services.<service-instance>.local_backup_path`: optional / PostgreSQL-specific, path where to store backup files locally first before uploading them. Otherwise streams directly to S3 if not specified
- `services.<service-instance>.ignore_tables`: optional / MySQL-specific, array of table names to be ignored for the backup
- `services.<service-instance>.backup_options`: optional, allows specifying additional parameters and flags for service backup executable
- `services.<service-instance>.restore_options`: optional, allows specifying additional parameters and flags for service restore executable

Note: Usage of `s3.encryption_key` is not backward compatible! Backups generated without or with a different encryption key cannot be downloaded or restored anymore.
