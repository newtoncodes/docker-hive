# Swarm

Docker swarm installation and tools.

#### Links
https://github.com/robinong79/docker-swarm-monitoring

### Swarm management

| Service | Purpose |
| ------ | ----- |
| [Portainer](https://hub.docker.com/r/portainer/portainer/) | Docker management GUI |

### Monitoring

| Service | Purpose |
| ------ | ----- |
| [Prometheus](https://hub.docker.com/r/prom/prometheus/) | Central Metric Collecting |
| [CAdvisor](https://hub.docker.com/r/google/cadvisor/) | Collecting Container information  |
| [Exporter](https://hub.docker.com/r/basi/node-exporter/) | Collecting Hardware and OS information |
| [AlertManager](https://hub.docker.com/r/prom/alertmanager/) | Sending out alerts raised from Prometheus |
| [Grafana](https://hub.docker.com/r/grafana/grafana/) | Dashboard on top of Prometheus |

### Log

| Service | Purpose |
| ------ | ----- |
| [ElasticSearch](https://hub.docker.com/_/elasticsearch/) | Central storage for Logdata |
| [LogStash](https://hub.docker.com/_/logstash/) | Log formatter and processing pipeline |
| [ElastAlert](https://hub.docker.com/r/ivankrizsan/elastalert/) | Sending out alerts raised on Logs |
| [Kibana](https://hub.docker.com/_/kibana/) | Dashboard on top of Elasticsearch |

### Container/Service log to Logstash

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
