## Configuration on Kubernetes

On Kubernetes backman is usually configured through a combination of a **Secret** containing a `config.json` configuration file thats mounted into the backman container, and then additional **Secret**s mounted into the `$SERVICE_BINDING_ROOT` path inside the container.

backman will automatically detect and use any service bindings found under the `$SERVICE_BINDING_ROOT` path.

### The `config.json` part

// TODO: explain `config.json` options specifically for Kubernetes use-cases

// TODO: explain `backman -config /<path>/config.json`

### The `$SERVICE_BINDING_ROOT` part

On Kubernetes there's a simple and elegant way for apps to have service credentials injected and automatically detected at runtime, it's called the [Service Binding for Kubernetes](https://servicebinding.io/) specification.

With it service providers can easily expose bindings to workload through a **Secret** resource mounted into the container, containing all data required for connectivity to a particular service.

The data format to be used in such a **Secret** is describe [here](https://servicebinding.io/spec/core/1.0.0/#workload-projection), together with some common [well-known entries](https://servicebinding.io/spec/core/1.0.0/#well-known-secret-entries), and how to use them for workloads and mount them into a container can be found in the [application developers guide](https://servicebinding.io/application-developer/).

There are also many libraries already available that support and understand the servicebinding.io spec and will automatically detect any such bindings for you.

For example:
- https://github.com/spring-cloud/spring-cloud-bindings
- https://github.com/nebhale/client-go
- https://github.com/nodeshift/kube-service-bindings

and many more...

#### Service Binding configuration example

backman fully supports automatic detection of any such service bindings. It will read all the contents of the path specified via [`$SERVICE_BINDING_ROOT`](https://servicebinding.io/application-developer/) environment variable (which defaults to `/bindings` if not set and is thus not mandatory).

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

backman now can read and parse all of these automatically and use it for its service instance configuration.

---

Whether or not you are actually using service bindings or have service binding controllers or operators present in your cluster, the service binding spec is certainly an elegant and simple way to provide service configuration information to your workload.
