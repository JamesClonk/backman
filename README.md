# :minidisc: backman

a backup-manager app for [Cloud Foundry](https://www.cloudfoundry.org/)

## Usage

1. pick a Cloud Foundry provider
   I'd suggest the [Swisscom AppCloud](https://developer.swisscom.com/)
2. create a service instance of an S3-compatible object storage
3. modify the provided `manifest.yml`, specify your service instance(s)
4. deploy the app
5. enjoy!

## Screenshots

* shows all bound service instances

![backman services](https://raw.githubusercontent.com/JamesClonk/backman/master/static/images/backman_services_listing.png "backman services")

* display service, trigger backups/restores

![backman service](https://raw.githubusercontent.com/JamesClonk/backman/master/static/images/backman_service_view.png "backman service")

## Supported databases

- MariaDB / MySQL
- PostgreSQL
- MongoDB
