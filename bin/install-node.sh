#!/usr/bin/env bash

if [ -z "$INSTALL_PATH" ]; then
    echo "Install path:"
    read INSTALL_PATH
fi
DIRNAME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


INSTALL_PATH="$INSTALL_PATH" bash "$DIRNAME/install.sh"


echo "Swarm host:"
read SWARM_HOST

echo "Swarm port:"
read SWARM_PORT

echo "Swarm token:"
read SWARM_TOKEN


# Init swarm
docker swarm join --token "$SWARM_TOKEN" "$SWARM_HOST:$SWARM_PORT"


#bash "$INSTALL_PATH/bin/docker/node.sh"