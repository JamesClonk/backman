# :minidisc: backman

[![CircleCI](https://circleci.com/gh/swisscom/backman.svg?style=svg)](https://circleci.com/gh/swisscom/backman)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/swisscom/backman/blob/master/LICENSE)
[![Platform](https://img.shields.io/badge/platform-Cloud%20Foundry-lightgrey)](https://developer.swisscom.com/)

a backup-manager app for [Cloud Foundry](https://www.cloudfoundry.org/) and [Kubernetes](https://kubernetes.io/)

## Supported databases

- MariaDB / MySQL
- PostgreSQL
- MongoDB
- Elasticsearch
- Redis

## Usage

[How to use backman?](/docs/usage.md)

## Configuration

[How to configure backman?](/docs/configuration.md)
[Cloud Foundry specific configuration guide](/docs/cloudfoundry/configuration.md)
[Kubernetes specific configuration guide](/docs/kubernetes/configuration.md)

## Deploy

[How to deploy backman on Cloud Foundry?](/docs/cloudfoundry/deployment.md)
[How to deploy backman on Kubernetes?](/docs/kubernetes/deployment.md)

## Metrics

[Metrics in backman](/docs/metrics.md)

## API

[How to use the backman API?](/docs/usage.md#The API)
// TODO: check above link

## Screenshots

* shows all bound service instances

![backman services](https://raw.githubusercontent.com/swisscom/backman/master/static/images/backman_services_listing.png "backman services")

* display service, trigger backups/restores

![backman service](https://raw.githubusercontent.com/swisscom/backman/master/static/images/backman_service_view.png "backman service")
