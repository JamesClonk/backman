## Kubernetes deployments

backman can of course also be deployed onto a Kubernetes cluster. There are [ytt](https://carvel.dev/ytt/) templates provided under [kubernetes/templates](https://github.com/swisscom/backman/tree/master/kubernetes/templates) that can be used to generate and deploy to Kubernetes. Some useful helper scripts can be found under [kubernetes](https://github.com/swisscom/backman/tree/master/kubernetes).

To deploy via [ytt](https://carvel.dev/ytt/) and [kapp](https://carvel.dev/kapp/):

1. clone this repository
2. go into the kubernetes folder
3. edit `values.yml`.
	See [sample_values.yml](https://github.com/swisscom/backman/tree/master/kubernetes/sample_values.yml) for reference.
4. run `./deploy.sh`

Additionally if you don't want to use any of the [carvel.dev](https://carvel.dev/) tooling you can just make use of the provided example [deploy.yml](https://github.com/swisscom/backman/tree/master/kubernetes/example/deploy.yml), which is a complete pre-rendered Kubernetes deployment manifest. Please edit it first though to adjust its backman configuration values, the **Secret**, **Ingress** and **NetworkPolicy** resources, the default values these contain will very likely *not* work for you!



// TODO: rework all of it
