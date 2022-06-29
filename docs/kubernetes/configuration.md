# Configuration on Kubernetes

On Kubernetes backman is usually configured through a combination of a **Secret** containing a `config.json` configuration file thats mounted into the backman container, and then additional **Secret**s mounted into the `$SERVICE_BINDING_ROOT` path inside the container.

backman will automatically detect and use any service bindings found under the `$SERVICE_BINDING_ROOT` path.

## `config.json` - configuration file

We've learned how backman can be configured through a configuration file, usually named `config.json`, and how this file looks like with all its possible properties and configuration options in the main [configuration documentation](/docs/configuration.md).

When deploying backman on Kubernetes we need a way to easily define and pass this config file to backman. The way to do that is by creating a **Secret** that will contain the entire `config.json` file. This allows us then to mount that **Secret** as a volume file into the backman container.

Such a **Secret** could for example look like this:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backman-config-secret
type: Opaque
stringData:
  config.json: |
    {
      "logging_timestamp": true,
      "disable_metrics_logging": true,
      "disable_health_logging": true,
      "unprotected_metrics": true,
      "unprotected_health": true,
      "s3": {
        "service_label": "s3",
        "bucket_name": "backman-storage",
        ... etc ...
      },
      "services": { 
        ... etc ...
      }
    }
```

### Mounting `config.json` into the container

Once we have our configuration **Secret** ready we can simply mount it into the container as a file and tell backman to use it with command arguments (`args: [ "-config", "<path>/<to>/<config.json>" ]`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backman
spec:
  template:
    spec:
      containers:
      - name: backman
        command: [ "backman" ]
        args: [ "-config", "/backman/config.json" ] # <-- specify our mounted config file
        volumeMounts:
        - mountPath: /backman/config.json # <-- mount the config file here
          name: backman-config-secret
          subPath: config.json
      volumes:
      - name: backman-config-secret
        secret:
          secretName: backman-config-secret
```

## `$SERVICE_BINDING_ROOT` - service bindings

On Kubernetes there's a simple and elegant way for apps to have service credentials injected and automatically detected at runtime, it's called the [Service Binding for Kubernetes](https://servicebinding.io/) specification.

With it service providers can easily expose bindings to workload through a **Secret** resource mounted into the container, containing all data required for connectivity to a particular service.

The data format to be used in such a **Secret** is describe [here](https://servicebinding.io/spec/core/1.0.0/#workload-projection), together with some common [well-known entries](https://servicebinding.io/spec/core/1.0.0/#well-known-secret-entries), and how to use them for workloads and mount them into a container can be found in the [application developers guide](https://servicebinding.io/application-developer/).

There are also many libraries already available that support and understand the servicebinding.io spec and will automatically detect any such bindings for you.

For example:
- https://github.com/spring-cloud/spring-cloud-bindings
- https://github.com/nebhale/client-go
- https://github.com/nodeshift/kube-service-bindings

and many more...

### Service Binding configuration example

backman fully supports automatic detection of any such service bindings. It will read all the contents of the path specified via [`$SERVICE_BINDING_ROOT`](https://servicebinding.io/application-developer/) environment variable (which defaults to `/bindings` if not set and is thus not mandatory).

> **Note**: Whether or not you are actually using service bindings or have service binding controllers or operators present in your cluster, the service binding spec is certainly an elegant and simple way to provide service configuration information to your workload.

Let's start by defining our service binding **Secret**, containing all the necessary data required for connectivity to the service:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-production-db
type: Opaque
stringData:
  type: mysql
  provider: bitnami
  uri: mysql://root:root-pw@productdb.mysql.svc.cluster.local:3306/productdb
  username: root
  password: root-pw
  database: productdb
```

Any such secrets then need to be mounted under `$SERVICE_BINDING_ROOT` into the backman container:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backman
spec:
  template:
    spec:
      containers:
      - name: backman
        volumeMounts:
        - mountPath: /bindings/my-production-db
          name: my-production-db
        - mountPath: /bindings/session-cache
          name: session-cache
      volumes:
      - name: my-production-db
        secret:
          secretName: my-production-db
      - name: session-cache
        secret:
          secretName: session-cache
```

This will result in the following directory and file structure being present within the backman container:

```plain
$SERVICE_BINDING_ROOT
├── my-production-db
│   ├── type
│   ├── provider
│   ├── uri
│   ├── username
│   ├── password
│   └── database
└── session-cache
    ├── type
    ├── provider
    ├── host
    ├── port
    └── password
```

backman now can read and parse all of these files and their contents automatically and use it for its service instance configuration.

---

That's it! Mounting a `config.json` together with some service binding **Secret**s into a backman **Deployment** is everything that's needed.

## Examples

You can check out this [deployment example](/docs/kubernetes/deployment.md#diy---minimal-deployment-example) to see all the pieces in action.

There are also some more deployment examples available under [kubernetes/deploy](/kubernetes/deploy). These can be deployed after just minimal editing or used as a reference for creating your own deployment manifests.

