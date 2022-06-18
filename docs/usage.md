# Using backman

## Quick deploy

###### Cloud Foundry specific
1. Login to Cloud Foundry.
2. Create a service instance of an S3-compatible object storage
3. Modify the provided `manifest.yml`, specify your service instance(s)
4. Configure backman, either through the provided `config.json` or with the environment variable `BACKMAN_CONFIG` (see `manifest.yml` example)
5. `cf push`

See Cloud Foundry specific [configuration](/docs/cloudfoundry/configuration.md) and [deployment](/docs/cloudfoundry/deployment.md) documentation for more detailed information.

###### Kubernetes specific

// TODO: add quick deploy steps on k8s

See Kubernetes specific [configuration](/docs/kubernetes/configuration.md) and [deployment](/docs/kubernetes/deployment.md) documentation for more detailed information.

## The UI

// TODO: explain the UI

## The API

backman has an API which can be used to trigger backups & restores.
Have a look at the [Swagger documentation](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/swisscom/backman/master/swagger.yml)

// TODO: show some curl examples

### Using Cloud Foundry tasks

###### Cloud Foundry specific
backman also supports running as a one-off task inside Cloud Foundry. Simply push the app as normal, stop it, and then run it via `cf run-task` with `/app/backman -backup <service_name>` as task command to run a backup. For restoring an existing backup you can use `/app/backman -restore <service_name> -filename <backup_filename>`.
