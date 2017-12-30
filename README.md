# Swarm

Docker swarm installation and tools.

#### Links
https://github.com/robinong79/docker-swarm-monitoring

## Used components

We have split up the monitoring into 2 basic parts:

#### Monitoring Stack

| Service | Purpose |
| ------ | ----- |
| [Prometheus](https://hub.docker.com/r/prom/prometheus/) | Central Metric Collecting |
| [CAdvisor](https://hub.docker.com/r/google/cadvisor/) | Collecting Container information  |
| [Node-Exporter](https://hub.docker.com/r/basi/node-exporter/) | Collecting Hardware and OS information |
| [AlertManager](https://hub.docker.com/r/prom/alertmanager/) | Sending out alerts raised from Prometheus |
| [Grafana](https://hub.docker.com/r/grafana/grafana/) | Dashboard on top of Prometheus |

#### Logging Stack

| Service | Purpose |
| ------ | ----- |
| [ElasticSearch](https://hub.docker.com/_/elasticsearch/) | Central storage for Logdata |
| [LogStash](https://hub.docker.com/_/logstash/) | Log formatter and processing pipeline |
| [ElastAlert](https://hub.docker.com/r/ivankrizsan/elastalert/) | Sending out alerts raised on Logs |
| [Kibana](https://hub.docker.com/_/kibana/) | Dashboard on top of Elasticsearch |

## Preparation

Host setting for ElasticSearch (Look [here](https://www.elastic.co/guide/en/elasticsearch/reference/5.0/vm-max-map-count.html) for more information)
```
$ sysctl -w vm.max_map_count=262144
```

#### Docker

```
$ docker swarm init
$ docker network create -d overlay swarm-monitoring
$ docker network create -d overlay swarm-log
```

#### Compose files

Make sure to look at the compose files for the volume mappings.
In this example everything is mapped to /var/dockerdata/<servicename>/<directories>. Adjust this to your own liking or create the same structure as used in this example.

#### Config Files

| Config file | Needs to be in <Location> | Remarks |
| ----- | ----- | ----- | 
| alertmanagerconfig.yml | /var/dockerdata/alertmanager/ | The alerts go through Slack. Use your Slack Key and channel name for it to work |
| elastalert_supervisord.conf | /var/dockerdata/elastalert/config | - |
| elastalertconfig.yaml | /var/dockerdata/elastalert/config | - |
| prometheus.yml | /var/dockerdata/prometheus | - |

#### Alert Files

| Alert file | Needs to be in <Location> | Remarks |
| ----- | ----- | ----- | 
| alertrules.nodes | /var/dockerdata/prometheus/rules | - |
| alertrules.task | /var/dockerdata/prometheus/rules | - |
| elastrules.error.yaml| /var/dockerdata/elastalert/rules | The alerts go through Slack. Use your Slack Key and channel name for it to work |


## Installation

#### Logging Stack

```
$ docker deploy --compose-file log.yml swarm-log
```

#### Monitoring Stack

```
$ docker deploy --compose-file monitoring.yml swarm-monitoring
```

#### Container/Service log to Logstash

In order to get the logs from the services/containers to Logstash you need to start them with a different logdriver.

Compose file:

```
log:
    driver: gelf
    options:
        gelf-address: "udp://127.0.0.1:12201"
        tag: "<name of container for filtering in elasticsearch>" 
```

Run command:

```
$ docker run \
         --log-driver=gelf \
         --log-opt gelf-address=udp://127.0.0.1:12201 \
         --log-opt tag="<name of container for filtering in elasticsearch>" \
         ....
         ....
```         
