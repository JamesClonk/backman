# Configuration on Cloud Foundry

Since backman usually gets deployed as a container image on Cloud Foundry, and the image contents are frozen, it cannot be configured by providing or modifying a simple configuration file like `config.json`. 
In Cloud Foundry the general approach thats recommended to configure your applications is the [12-factor app](https://12factor.net) principle, meaning the use environment variables to configure everything relevant for your app. For backman this would be `$BACKMAN_CONFIG`.

## `$BACKMAN_CONFIG`

You can set environment variables under the `env:` section in your backman application `manifest.yml` or via the CLI with `cf set-env ...`. All we need to do is set an environment variable named **BACKMAN_CONFIG**, containing the entire JSON document that would otherwise be inside the `config.json` configuration file.
When starting up backman will then read this variable and parse the contents as if it were a configuration file.

Check out the [manifest.yml example](/docs/cloudfoundry/deployment.md#manifestyml-example) on how this looks like.

Please consult the main [configuration documentation](/docs/configuration.md) for a detailed description on all possible configuration options.

In addition to `$BACKMAN_CONFIG` it is also common on Cloud Foundry deployments to make use of the environment variables `$BACKMAN_USERNAME`, `$BACKMAN_PASSWORD` and sometimes `$BACKMAN_ENCRYPTION_KEY`.
While the configuration option each of these represent could also be set directly within the configuration file `config.json` (or rather `$BACKMAN_CONFIG` in this case), the reason for having them separately is to be able to inject their values during `cf push` stage and not have them hardcoded beforehand within the configuration itself.
This is achieved by making use of the `cf` CLIs [variable substitution](https://docs.cloudfoundry.org/devguide/deploy-apps/manifest-attributes.html#variable-substitution) feature.

If you have a close look at the provided `manifest.yml` example, you will see that for both `$BACKMAN_USERNAME` and `$BACKMAN_PASSWORD` there are such variable references in there instead of actual values:
```yaml
...
  env:
    ...
    BACKMAN_USERNAME: ((username))
    BACKMAN_PASSWORD: ((password))
...
```

This means that during deployment you will then be able to inject the actual values with:     
`cf push -f manifest.yml --var username=MyUserName --var password=SuperSecretPW12345`

## Service bindings and their credentials

Just as with any configuration information, in line with the 12-factor app principles service bindings are also configured and thus automatically detected via [`$VCAP_SERVICES`](https://docs.cloudfoundry.org/devguide/deploy-apps/environment-variable.html#VCAP-SERVICES) environment variable when backman is running on Cloud Foundry.
Any service bindings present within this environment variable will be parsed by backman. The content of `$VCAP_SERVICES` is set by Cloud Foundry itself, you do not have to define this variable yourself. It will automatically contain any service instances you bind to the backman app, either via `cf bind-service ...` or by specifying the service instance(s) in the `manifest.yml` under the `services:` section.
