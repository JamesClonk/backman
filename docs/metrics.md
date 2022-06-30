# Metrics

backman exposes a set of metrics through its [Prometheus](https://prometheus.io/docs/introduction/overview/) `/metrics` endpoint.

The `/metrics` endpoint can be disabled entirely by setting `disable_metrics` to `true` if you do not want to make use of it (see [JSON configuration](/docs/configuration.md#json-properties)).

The endpoint can also be made available without *HTTP Basic Auth* protection, by setting `unprotected_metrics` to `true`. 

##### Kubernetes specific

It is recommended to disable the *HTTP Basic Auth* protection specifically for the `/metrics` endpoint in a Kubernetes deployment, to allow Prometheus to scrape the endpoint without needing any custom configuration for credentials.

For the same reason it also advisable to disable logging output for any HTTP request going to this endpoint by setting `disable_metrics_logging` to `true`, otherwise your container logs will be full of `/metrics` requests.

### Example `/metrics` output
```
$ curl https://my-backman-url/metrics

# HELP backman_backup_files_total Number of backup files in total per service.
# TYPE backman_backup_files_total gauge
backman_backup_files_total{name="my-elasticsearch",type="elasticsearch"} 7
backman_backup_files_total{name="my_mongodb",type="mongodb"} 1
backman_backup_files_total{name="my_postgres_db",type="postgres"} 25
# HELP backman_backup_filesize_last Filesize of last / most recent backup file per service.
# TYPE backman_backup_filesize_last gauge
backman_backup_filesize_last{name="my-elasticsearch",type="elasticsearch"} 58404
backman_backup_filesize_last{name="my_mongodb",type="mongodb"} 1067
backman_backup_filesize_last{name="my_postgres_db",type="postgres"} 684
# HELP backman_backup_filesize_total Total filesize sum of all backup files per service.
# TYPE backman_backup_filesize_total gauge
backman_backup_filesize_total{name="my-elasticsearch",type="elasticsearch"} 408740
backman_backup_filesize_total{name="my_mongodb",type="mongodb"} 1067
backman_backup_filesize_total{name="my_postgres_db",type="postgres"} 7404
# HELP backman_backup_failures_total Total number of backup failures per service.
# TYPE backman_backup_failures_total counter
backman_backup_failures_total{name="my-elasticsearch",type="Elasticsearch"} 3
backman_backup_failures_total{name="my_mongodb",type="MongoDB"} 1
backman_backup_failures_total{name="my_postgres_db",type="PostgreSQL"} 3
# HELP backman_backup_success_total Total number of backup failures per service.
# TYPE backman_backup_success_total counter
backman_backup_success_total{name="my-elasticsearch",type="Elasticsearch"} 18
backman_backup_success_total{name="my_mongodb",type="MongoDB"} 4
backman_backup_success_total{name="my_postgres_db",type="PostgreSQL"} 4
# HELP backman_backup_queued Backups currently in queue per service.
# TYPE backman_backup_queued gauge
backman_backup_queued{name="my-elasticsearch",type="elasticsearch"} 0
backman_backup_queued{name="my_mongodb",type="mongodb"} 0
backman_backup_queued{name="my_postgres_db",type="postgres"} 0
# HELP backman_backup_running Current running state of backups triggered per service.
# TYPE backman_backup_running gauge
backman_backup_running{name="my-elasticsearch",type="elasticsearch"} 0
backman_backup_running{name="my_mongodb",type="mongodb"} 0
backman_backup_running{name="my_postgres_db",type="postgres"} 0
# HELP backman_backup_total Total number of backups triggered per service.
# TYPE backman_backup_total counter
backman_backup_total{name="my-elasticsearch",type="Elasticsearch"} 21
backman_backup_total{name="my_mongodb",type="MongoDB"} 5
backman_backup_total{name="my_postgres_db",type="PostgreSQL"} 7
# HELP backman_restore_failures_total Total number of restore failures per service.
# TYPE backman_restore_failures_total counter
backman_restore_failures_total{name="my-elasticsearch",type="Elasticsearch"} 2
# HELP backman_restore_success_total Total number of successful restores per service.
# TYPE backman_restore_success_total counter
backman_restore_success_total{name="my-elasticsearch",type="Elasticsearch"} 1
backman_restore_success_total{name="my_mongodb",type="MongoDB"} 2
# HELP backman_restore_queued Restores currently in queue per service.
# TYPE backman_restore_queued gauge
backman_restore_queued{name="my-elasticsearch",type="elasticsearch"} 0
backman_restore_queued{name="my_mongodb",type="mongodb"} 0
backman_restore_queued{name="my_postgres_db",type="postgres"} 0
# HELP backman_restore_running Current running state of restores triggered per service.
# TYPE backman_restore_running gauge
backman_restore_running{name="my-elasticsearch",type="elasticsearch"} 1
backman_restore_running{name="my_mongodb",type="mongodb"} 0
backman_restore_running{name="my_postgres_db",type="postgres"} 0
# HELP backman_restore_total Total number of restores triggered per service.
# TYPE backman_restore_total counter
backman_restore_total{name="my-elasticsearch",type="Elasticsearch"} 3
backman_restore_total{name="my_mongodb",type="MongoDB"} 2
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
