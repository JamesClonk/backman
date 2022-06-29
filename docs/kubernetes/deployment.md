## Kubernetes deployments

backman can of course also be deployed onto a Kubernetes cluster. There are advanced [ytt](https://carvel.dev/ytt/) templates provided under [kubernetes/build/templates](/kubernetes/build/templates) that can be used to generate a deployment manifest or directly deploy to Kubernetes through some useful helper scripts that can be found under [kubernetes/build](/kubernetes/build).

The other more simple and beginner friendly approach would be to use one of the pre-rendered deployment manifest examples, which can be found under [kubernetes/deploy](/kubernetes/deploy).

-----

### kubectl apply

To deploy one of the simple deployment manifests:

1. clone this repository
2. go into the `kubernetes/deploy` folder
3. choose and edit `full.yml` or `minimal.yml` to your liking
4. run `kubectl apply -f <filename.yml>`

The manifest files found under [kubernetes/deploy](/kubernetes/deploy) have been generated with example values through ytt templates. Please make sure to edit them first to adjust configuration values and service bindings, the **Secret**, **Ingress** and **NetworkPolicy** resources, etc.. The default values these contain will very likely *not* work for you!

#### DIY - minimal deployment example

A minimalistic hand-crafted example deployment could look something like this:
```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: backman
spec:
  ports:
  - port: 8080
    targetPort: 8080
  selector:
    app: backman

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backman
spec:
  selector:
    matchLabels:
      app: backman
  replicas: 1
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: backman
      annotations:
        # prometheus annotations for scraping metrics, you can remove them if you don't use prometheus
        prometheus.io/path: /metrics
        prometheus.io/port: "8080"
        prometheus.io/scrape: "true"
    spec:
      containers:
      - name: backman
        image: jamesclonk/backman:latest
        ports:
        - containerPort: 8080
        command:
        - backman
        args: # run backman with `-config /backman/config.json` arg, to specify path of configfile
        - -config
        - /backman/config.json
        env:
        - name: TZ # set local timezone if you want
          value: Europe/Zurich
        readinessProbe: # use backmans /metrics endpoint for readiness probe
          httpGet:
            path: /metrics
            port: 8080
        livenessProbe: # use backmans /healthz endpoint for liveness probe
          httpGet:
            path: /healthz
            port: 8080
        volumeMounts:
        # mount config.json from secret into container under /backman/config.json
        - mountPath: /backman/config.json
          name: backman-config
          subPath: config.json
        # mount mysql example service binding under /bindings/my-rds-db, according to servicebinding.io spec (https://servicebinding.io/spec/core/1.0.0/#workload-projection)
        - mountPath: /bindings/my-rds-db
          name: example-mysql-service-binding
      volumes:
      - name: backman-config
        secret:
          secretName: backman-config
      # add all service binding secrets here as volumes, so that they can be mounted into the container as files
      - name: example-mysql-service-binding
        secret:
          secretName: example-mysql-service-binding

---
apiVersion: v1
kind: Secret
metadata:
  name: backman-config
type: Opaque
stringData:
  # our backman configuration file
  # both `unprotected_metrics` and `unprotected_health` must be set to `true` for the above deployment to work,
  # because it is using /metrics and /healthz endpoints for container probes.
  config.json: |
    {
      "log_level": "info",
      "logging_timestamp": true,
      "disable_metrics_logging": true,
      "disable_health_logging": true,
      "unprotected_metrics": true,
      "unprotected_health": true,
      "username": "john.doe",
      "password": "foobar",
      "s3": {
        "service_label": "s3",
        "bucket_name": "backman-storage",
        "host": "s3.amazonaws.com",
        "access_key": "BKIKJAA5BMMU2RHO6IBB",
        "secret_key": "V7f1CwQqAcwo80UEIJEjc5gVQUSSx5ohQ9GSrr12"
      },
      "services": {
        "my-rds-db": {
          "schedule": "0 15 4 * * *",
          "timeout": "4h",
          "retention": {
            "days": 31,
            "files": 50
          }
        }
      }
    }

---
apiVersion: v1
kind: Secret
metadata:
  name: example-mysql-service-binding
type: Opaque
stringData: # an example service binding, according to servicebinding.io spec (https://servicebinding.io/application-developer/)
  name: my-rds-db
  type: mysql
  provider: AWS RDS
  host: mydb-instance.123456789012.us-east-1.rds.amazonaws.com
  port: "3306"
  username: admin
  password: c8ad01ed-1561-4fe0-b3ff-04a98c79b36d
  database: mysql_dbname
```

-----

### ytt and kapp

To deploy via [ytt](https://carvel.dev/ytt/) and [kapp](https://carvel.dev/kapp/):

1. clone this repository
2. go into the `kubernetes/build` folder
3. edit `values.yml`     
	See [example_values_full.yml](/kubernetes/build/example_values_full.yml) for reference.
4. run `./deploy.sh`
