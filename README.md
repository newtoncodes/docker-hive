# Swarm

Docker swarm node/master automated install.

#### Links

Inspired by: https://github.com/stefanprodan/swarmprom

## Install

```bash
apt-get install -y git
mkdir /node
git clone https://github.com/newtoncodes/swarm.git /node/installer
bash /node/installer/bin/install
```

### Swarm management

| Service | Purpose |
| ------ | ----- |
| [Portainer](https://hub.docker.com/r/portainer/portainer/) | Docker management GUI |

### Monitoring

| Service | Purpose |
| ------ | ----- |
| [Prometheus](https://hub.docker.com/r/prom/prometheus/) | Monitoring data collection tool |
| [CAdvisor](https://hub.docker.com/r/google/cadvisor/) | Prometheus data exporter for containers  |
| [Node exporter](https://hub.docker.com/r/basi/node-exporter/) | Prometheus data exporter for nodes |
| [Alert manager](https://hub.docker.com/r/prom/alertmanager/) | Sends alerts from Prometheus |
| [Grafana](https://hub.docker.com/r/grafana/grafana/) | Monitoring dashboard |


#### Delete all containers (force!! running or stopped containers)

```bash
docker rm -f $(docker ps -qa)
```

#### Delete old containers

```bash
docker ps -a | grep 'weeks ago' | awk '{print $1}' | xargs docker rm
```

#### Delete stopped containers

```bash
docker rm -v $(docker ps -a -q -f status=exited)
```

#### Delete containers after stopping

```bash
docker stop $(docker ps -aq) && docker rm -v $(docker ps -aq)
```

#### Delete dangling images

```bash
docker rmi $(docker images -q -f dangling=true)
```

#### Delete all images

```bash
docker rmi $(docker images -q)
```

#### Delete dangling volumes

```bash
docker volume rm $(docker volume ls -q -f dangling=true)
```

#### Delete all networks

```bash
docker network rm $(docker network ls)
```


TODO: readme
TODO: master iptables callback