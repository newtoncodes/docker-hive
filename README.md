# Docker hive

Docker **hive** is a cli app on top of docker swarm. It doesn't do much, just sets up your docker swarm easily.
The main purpose of docker hive is to install the monitoring stack, recommended for docker swarm infrastructure.
Once installed, it will expose all services required for the swarm management like prometheus, grafana, portainer, etc.

The nodejs based cli app is just to make our life easier, installing the full pack and updating it.

**This is not a fun project, it's meant for production use.**

### Features

- Full monitoring stack.
- Expose all hive management ports only on over a VPN.
- Sync iptables rules over the whole swarm without logging in on all nodes (encrypted).
- **Not having to remember lots of commands and settings**, everything comes out of the box.

### Swarm management and monitoring

- [Portainer](https://hub.docker.com/r/portainer/portainer/)     - Docker management GUI
- [Prometheus](https://hub.docker.com/r/prom/prometheus/)        - Monitoring data collection tool
- [CAdvisor](https://hub.docker.com/r/google/cadvisor/)          - Prometheus data exporter for containers
- [Node exporter](https://hub.docker.com/r/basi/node-exporter/)  - Prometheus data exporter for nodes
- [Alert manager](https://hub.docker.com/r/prom/alertmanager/)   - Sends alerts from Prometheus
- [Grafana](https://hub.docker.com/r/grafana/grafana/)           - Monitoring dashboard

* Also uses dockerd exporter with experimental mode.


## Usage

Basically, you install the package on all nodes.

On the master run: `hive init`

On the workers and secondary managers run: `hive join`

Run `hive iptables` to check the iptables rules you need to accept connections to the current node.

Run `hive nodes` to check if the list of nodes gets regularly updated.

Run `hive config` to edit the config file with nano. You need to restart the hive stack after that with `hive restart`.

A service will be installed after you init or join a swarm, it will update the nodes ip list when the master adds or removes a node.
This can be connected with an iptables callback that updates your iptables rules.

**It's recommended to expose the hive management ports over a VPN**

1. Prepare your openvpn client config for the server **without a password**.
2. Then after init/join, add the config to /etc/docker-hive/vpn and run `hive restart`.
3. Repeat the steps if you have more than one vpn to expose the ports to.

* If you don't have a VPN, you can publish the ports with the config or during init. **This is NOT secure**, so you should manually add iptables rules to allow those ports only for administrators.

**It's preferred if you don't publish the ports, but only publish them to the internal network with VPN.** No matter if they are published, or not, you can assess the services on these ports:
* http://SERVER_PUBLIC_OR_VPN_ADDRESS:**3000** => Portainer 
* http://SERVER_PUBLIC_OR_VPN_ADDRESS:**3001** => Grafana 
* http://SERVER_PUBLIC_OR_VPN_ADDRESS:**3002** => Unsee 
* http://SERVER_PUBLIC_OR_VPN_ADDRESS:**3003** => Prometheus 
* http://SERVER_PUBLIC_OR_VPN_ADDRESS:**3004** => Alertmanager


```
Usage: hive <cmd> <args ...>

Commands:
  hive init [-h <host>] [-i <interface>]              Create a new docker swarm.
  hive join [-t <type>] [-h <host>] [-i <interface>]  Join a docker swarm, managed by hive.
  hive leave                                          Leave the current swarm.
  hive reset                                          Reset the hive stack volumes.
  hive config                                         Edit the config with nano.
  hive start                                          Start the hive stack.
  hive stop                                           Stop the hive stack.
  hive restart                                        Restart the hive stack.
  hive node-add [ip]                                  Allow node to connect.
  hive node-rm [ip]                                   Remove node from the allowed list.
  hive nodes                                          List the allowed nodes.
  hive serve                                          Serve config to the worker/manager nodes.
  hive sync                                           Sync config with the master node.
  hive iptables [-s <file>]                           Print all iptables accept rules.
  hive install-dependencies                           Install dependencies (Ubuntu/Debian).

Options:
  --version  Show version number  [boolean]
  --help     Show help  [boolean]
```

#### Wondering how all this works?

This app is an "automation". It doesn't do magic and the code is not long or hard to read. Check it out.

## Install node

```bash
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -; sudo apt-get install -y nodejs
```

## Install docker-hive

```bash
npm install -g docker-hive
hive --help # If the hive command is busy, use docker-hive
```

For Ubuntu/Debian distributions:

```bash
hive install-dependencies
```

For other distributions you will need to install:

```bash
curl
docker-ce/ee
```

## Known issues

* You have to have open firewall when setting up workers.

## To do

* Video tutorial
* Autocomplete commands when double tab is pressed

#### Links

Inspired by: https://github.com/stefanprodan/swarmprom


## Helpful commands

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
