# Using backman

## Quick deploy

##### Cloud Foundry specific
1. Login to Cloud Foundry
2. Create a service instance of an S3-compatible object storage
3. Modify the provided `manifest.yml`, specify your service instance(s)
4. Configure backman with the environment variable `$BACKMAN_CONFIG` (see `manifest.yml` example)
5. `cf push`

See Cloud Foundry specific [configuration](/docs/cloudfoundry/configuration.md) and [deployment](/docs/cloudfoundry/deployment.md) documentation for more detailed information.

##### Kubernetes specific

1. Login to your Kubernetes cluster
2. Modify the provided `full.yml` or `minimal.yml` from the [kubernetes/deploy](/kubernetes/deploy) folder
4. run `kubectl apply -f <filename.yml>`

See Kubernetes specific [configuration](/docs/kubernetes/configuration.md) and [deployment](/docs/kubernetes/deployment.md) documentation for more detailed information.

## The UI

// TODO: explain the UI

## The API

backman has an API which can be used to create and restore backups.
Have a look at the [Swagger documentation](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/swisscom/backman/master/swagger.yml) for a full list of all API endpoints.

Here are some examples:

#### GET */api/v1/state/{service_type}/{service_name}*

This allows you to query the current status of a particular service within backman.
```bash
curl https://username:password@my-backman-url/api/v1/state/mysql/my_production_db | jq .
```
It should respond with HTTP status code `200` and a JSON representaion of the current service instance status and ongoing operation (if any). This is useful if you want to see if there is currently a backup being done, or failed, or finished.

#### GET */api/v1/services*

This endpoint lists all services in backman.
```bash
curl https://username:password@my-backman-url/api/v1/services | jq .
```
It should respond with HTTP status code `200` and a JSON representaion of all currently configured service instances in backman.

#### POST */api/v1/backup/{service_type}/{service_name}*

You can use this endpoint to trigger the creation of a new backup for a particular service.
```bash
curl -X POST https://username:password@my-backman-url/api/v1/backup/mongodb/my_document_db
```
It should respond with a HTTP status code `200` to indicate that the process was triggered. You could now use the above mentioned `/state` endpoint to continuously query for the status of the ongoing backup process.

---

Additionally there are also the `/healthz` and `/metrics` endpoints which serve a special purpose.

#### GET */healthz*

The `/healthz` endpoint can be used in Cloud Foundry or Kubernetes for continuously checking the health of your backman container.
```bash
curl https://my-backman-url/healthz
```
It should respond with `OK` and HTTP status code `200`. Anything else indicates a failed health check.

You can disable logging output for any HTTP request going to the `/healthz` endpoint by setting `disable_health_logging` to `true` (see [JSON configuration](/docs/configuration.md#json-properties)), additionally you can also make the endpoint available without HTTP basic-auth protection, by setting `unprotected_metrics` to `true`. Both of these options are very useful in a Kubernetes deployment in order to not spam the container logs too much by using `/healthz` for a readiness or liveness probe.

#### GET */metrics*

This is the Prometheus endpoint for scraping metrics about backman.
```bash
curl https://my-backman-url/metrics
```
See [metrics documentation](/docs/metrics.md) for response format.

The `/metrics` endpoint can be disabled by setting `disable_metrics` to `true` (see [JSON configuration](/docs/configuration.md#json-properties)).
The endpoint can also be made available without HTTP basic-auth protection, by setting `unprotected_metrics` to `true`. This is useful in Kubernetes deployments to allow Prometheus to scrape the endpoint without needing custom configuration for the credentials. For the same reason it also possible to disable logging output for any HTTP request going to the `/metrics` endpoint by setting `disable_metrics_logging` to `true`.

## On-demand backup with Cloud Foundry tasks

##### Cloud Foundry specific
backman also supports running as a one-off task inside Cloud Foundry. Simply push the app as normal, stop it, and then run it via `cf run-task` with `/app/backman -backup <service_name>` as task command to run a backup. For restoring an existing backup you can use `/app/backman -restore <service_name> -filename <backup_filename>`.
