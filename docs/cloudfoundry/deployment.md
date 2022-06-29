## Cloud Foundry deployments

Deploying backman onto Cloud Foundry is pretty straightforward.

All you need to do is edit the provided `manifest.yml` inside this repository and then push it.

---

### cf push

To deploy backman with a `manifest.yml`:

1. Clone this repository
2. Login to Cloud Foundry (`cf login ...`)
3. Create a new service instance of an S3-compatible object storage (`cf cs ...`) if not yet available
4. Modify the provided `manifest.yml`, specify the S3 service instance and any other of your service instance(s) accordingly
4. Configure backman through the environment variable `$BACKMAN_CONFIG` in your `manifest.yml`
5. Run `cf push -f manifest.yml`

Backman should now be up and running and you can visit the configured route from `manifest.yml` with your browser to have a look at the web UI. Any service bound to the app in Cloud Foundry will be automatically detected and should be visible on the web UI.

---

#### manifest.yml example

```yaml
---
# See manifest.yml documentation available at:
# https://docs.developer.swisscom.com/devguide/deploy-apps/manifest.html

applications:
- name: backman # name of your application
  memory: 1G # mysqldump consumes a lot of memory, no matter how small the database is. keep this at least at 1G.
  disk_quota: 1G
  instances: 1 # do not configure more than 1 instance, backman does not coordinate work among itself!
  health-check-type: http # or 'port' if you don't want to use the /healthz endpoint
  health-check-http-endpoint: /healthz

  routes: # configure the route for the backman web UI / API
  - route: my-backman.scapp-corp.swisscom.com

  services: # services instances you want to bind to backman
  - backman-s3-storage # one S3 service must be configured for backman to work
  # add any database services here that you want backman to backup for you
  - my_mysql_db
  - my_postgres_db
  - my_mongodb
  - my_elasticsearch
  - my_redis

  # push as a container image
  docker:
    image: jamesclonk/backman:latest
    # choose image version/tag from https://github.com/swisscom/backman/releases
    # or https://hub.docker.com/r/jamesclonk/backman/tags
    # or stay on 'latest' if you're feeling adventurous

  env:
    TZ: Europe/Zurich

    BACKMAN_USERNAME: ((username)) # optional, username for HTTP Basic Auth
    BACKMAN_PASSWORD: ((password)) # optional, password for HTTP Basic Auth
    # BACKMAN_ENCRYPTION_KEY: "" #  optional, data-at-rest-encryption for backups stored on S3

    # please consult /docs/configuration.md and /docs/cloudfoundry/configuration.md for more details
    BACKMAN_CONFIG: |
      {
        "logging_timestamp": false,
        "disable_metrics_logging": true,
        "disable_health_logging": true,
        "unprotected_metrics": false,
        "unprotected_health": true,
        "s3": {
          "service_label": "dynstrg",
          "bucket_name": "backman-storage"
        },
        "services": {
          "my_postgres_db": {
            "schedule": "0 0 2,18,22 * * *",
            "timeout": "2h",
            "retention": {
              "days": 90,
              "files": 20
            }
          },
          "my-elasticsearch": {
            "direct_s3": true
          },
          "my_mysql_db": {
            "timeout": "35m",
            "disable_column_statistics": true
          },
          "my_mongodb": {
            "log_stderr": true,
            "schedule": "0 45 0/4 * * *",
            "retention": {
              "files": 500
            }
          }
        }
      }
```
