# :minidisc: backman

a backup-manager app for [Cloud Foundry](https://www.cloudfoundry.org/)

## Supported databases

- MariaDB / MySQL
- PostgreSQL
- MongoDB
- Elasticsearch

## Usage

1. pick a Cloud Foundry provider
   I'd suggest the [Swisscom AppCloud](https://developer.swisscom.com/)
2. create a service instance of an S3-compatible object storage
3. modify the provided `manifest.yml`, specify your service instance(s)
4. configure backman, either through the provided `config.json` or by the environment variable `BACKMAN_CONFIG` (see `manifest.yml`)
5. deploy the app
6. enjoy!

## Configuration

backman can be configured via JSON configuration, either with a file `config.json` in it's root directory, or by the environment variable `BACKMAN_CONFIG`.
Values configured in `BACKMAN_CONFIG` take precedence over `config.json`.
By default backman will assume useful values for all services/backups unless configured otherwise.

These here are the default values backman will use if not configured via JSON:
```json
{
	"log_level": "info",
	"logging_timestamp": false,
	"s3": {
		"service_label": "dynstrg",
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
- `s3.service_label`: optional, defines which service label backman will look for to find the S3-compatible object storage
- `s3.bucket_name`: optional, bucket to use on S3 storage, backman will use service-instance/binding-name if not configured
- `services.<service-instance>.schedule`: optional, defines cron schedule for running backups
- `services.<service-instance>.timeout`: optional, backman will abort a running backup/restore if timeout is exceeded
- `services.<service-instance>.retention.days`: optional, specifies how long backman will keep backups on S3 at maximum for this service instance
- `services.<service-instance>.retention.files`: optional, specifies how maximum number of files backman will keep on S3 for this service instance

## Metrics

backman exposes a couple of metrics via [Prometheus](https://prometheus.io/docs/introduction/overview/) endpoint `/metrics`.

Example:
```
$ curl localhost:9990/metrics

# HELP backman_backup_failures_total Total number of backup failures per service.
# TYPE backman_backup_failures_total counter
backman_backup_failures_total{service_name="my-elasticsearch",service_type="Elasticsearch"} 3
backman_backup_failures_total{service_name="my_mongodb",service_type="MongoDB"} 1
backman_backup_failures_total{service_name="my_postgres_db",service_type="PostgreSQL"} 3
# HELP backman_backup_success_total Total number of backup failures per service.
# TYPE backman_backup_success_total counter
backman_backup_success_total{service_name="my-elasticsearch",service_type="Elasticsearch"} 18
backman_backup_success_total{service_name="my_mongodb",service_type="MongoDB"} 4
backman_backup_success_total{service_name="my_postgres_db",service_type="PostgreSQL"} 4
# HELP backman_backups_total Total number of backups triggered per service.
# TYPE backman_backups_total counter
backman_backups_total{service_name="my-elasticsearch",service_type="Elasticsearch"} 21
backman_backups_total{service_name="my_mongodb",service_type="MongoDB"} 5
backman_backups_total{service_name="my_postgres_db",service_type="PostgreSQL"} 7
# HELP backman_restore_failures_total Total number of restore failures per service.
# TYPE backman_restore_failures_total counter
backman_restore_failures_total{service_name="my-elasticsearch",service_type="Elasticsearch"} 2
# HELP backman_restore_success_total Total number of successful restores per service.
# TYPE backman_restore_success_total counter
backman_restore_success_total{service_name="my-elasticsearch",service_type="Elasticsearch"} 1
backman_restore_success_total{service_name="my_mongodb",service_type="MongoDB"} 2
# HELP backman_restores_total Total number of restores triggered per service.
# TYPE backman_restores_total counter
backman_restores_total{service_name="my-elasticsearch",service_type="Elasticsearch"} 3
backman_restores_total{service_name="my_mongodb",service_type="MongoDB"} 2
# HELP backman_scheduler_backup_failures_total Total number of backup failures over crontab-schedule.
# TYPE backman_scheduler_backup_failures_total counter
backman_scheduler_backup_failures_total 0
# HELP backman_scheduler_backup_success_total Total number of successful backups over crontab-schedule.
# TYPE backman_scheduler_backup_success_total counter
backman_scheduler_backup_success_total 4
# HELP backman_scheduler_runs_total Total number of backup runs triggered over crontab-schedule.
# TYPE backman_scheduler_runs_total counter
backman_scheduler_runs_total 4
```

## Screenshots

* shows all bound service instances

![backman services](https://raw.githubusercontent.com/swisscom/backman/master/static/images/backman_services_listing.png "backman services")

* display service, trigger backups/restores

![backman service](https://raw.githubusercontent.com/swisscom/backman/master/static/images/backman_service_view.png "backman service")
