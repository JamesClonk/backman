## Note: this project has been moved to https://github.com/swisscom/backman and will not be maintained here anymore.

# :minidisc: backman

[![CircleCI](https://circleci.com/gh/swisscom/backman/tree/master.svg?style=shield)](https://circleci.com/gh/swisscom/backman/?branch=master)
[![CircleCI](https://img.shields.io/github/workflow/status/swisscom/backman/snyk%20golang%20scan?label=snyk%20code)](https://github.com/swisscom/backman/actions/workflows/snyk-golang.yml)
[![CircleCI](https://img.shields.io/github/workflow/status/swisscom/backman/snyk%20container%20scan?label=snyk%20container)](https://github.com/swisscom/backman/actions/workflows/snyk-container.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-lightgrey)](https://github.com/swisscom/backman/blob/master/LICENSE)
[![Platform](https://img.shields.io/badge/platform-Cloud%20Foundry-lightblue)](https://cloudfoundry.org/)
[![Platform](https://img.shields.io/badge/platform-Kubernetes-blue)](https://kubernetes.io/)

a backup-manager app for [Cloud Foundry](https://www.cloudfoundry.org/) and [Kubernetes](https://kubernetes.io/)

## Supported databases

- 🐬 MariaDB / MySQL
- 🐘 PostgreSQL
- 🥭 MongoDB
- 🌸 Elasticsearch
- 🏮 Redis

## Usage

- [How to use backman?](/docs/usage.md)

## Configuration

- [How to configure backman?](/docs/configuration.md)
- [Cloud Foundry specific configuration guide](/docs/cloudfoundry/configuration.md)
- [Kubernetes specific configuration guide](/docs/kubernetes/configuration.md)

## Deploy

- [How to deploy backman on Cloud Foundry?](/docs/cloudfoundry/deployment.md)
- [How to deploy backman on Kubernetes?](/docs/kubernetes/deployment.md)

## Metrics

- [Metrics in backman](/docs/metrics.md)

## API

- [How to use the backman API?](/docs/usage.md#the-api)

## Screenshots

##### show all configured service instances

![backman services](/static/images/backman_services_listing.png "backman services")

##### display service, trigger backups or restores

![backman service](/static/images/backman_service_view.png "backman service")
