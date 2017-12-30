#!/usr/bin/env bash

if [ -z "$INSTALL_PATH" ]; then
    echo "Install path:"
    read INSTALL_PATH
fi
DIRNAME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


INSTALL_PATH="$INSTALL_PATH" bash "$DIRNAME/install.sh"

cp -r "$DIRNAME/../install/config/docker" "$INSTALL_PATH/config/"
cp -r "$DIRNAME/../install/bin/docker" "$INSTALL_PATH/bin/"
cp -r "$DIRNAME/../install/docker" "$INSTALL_PATH/"

chmod +x "$INSTALL_PATH/bin/swarm.sh"

# Host setting for ElasticSearch
sysctl -w vm.max_map_count=262144

# Init swarm
docker swarm init

# Init main networks
docker network create -d overlay swarm-portainer
docker network create -d overlay swarm-monitoring
docker network create -d overlay swarm-log

echo "Slack key:"
read SLACK_KEY

echo "Slack channel:"
read SLACK_CHANNEL

sed -i "s/{{SLACK_KEY}}/$SLACK_KEY/" "$INSTALL_PATH/config/docker/variables.sh"
sed -i "s/{{SLACK_CHANNEL}}/$SLACK_CHANNEL/" "$INSTALL_PATH/config/docker/variables.sh"

sed -i "s#{{INSTALL_PATH}}#$INSTALL_PATH#" "$INSTALL_PATH/config/docker/stack.yml"

#bash "$INSTALL_PATH/bin/docker/master.sh"