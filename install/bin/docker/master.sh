#!/usr/bin/env bash

INSTALL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INSTALL_PATH="$INSTALL_PATH/../../";

source "$INSTALL_PATH/config/docker/variables.sh"

rm -rf "$INSTALL_PATH/docker/alertmanager/config/alertmanager.yml"
cp "$INSTALL_PATH/docker/alertmanager/config/alertmanager.yml.original" "$INSTALL_PATH/docker/alertmanager/config/alertmanager.yml"

rm -rf "$INSTALL_PATH/docker/elastalert/rules/elastrules.error.yaml"
cp "$INSTALL_PATH/docker/elastalert/rules/elastrules.error.yaml.original" "$INSTALL_PATH/docker/elastalert/rules/elastrules.error.yaml"

sed -i "$INSTALL_PATH/docker/alertmanager/config/alertmanager.yml" "s/{{SLACK_KEY}}/$SWARM_SLACK_KEY/"
sed -i "$INSTALL_PATH/docker/alertmanager/config/alertmanager.yml" "s/{{SLACK_CHANNEL}}/$SWARM_SLACK_CHANNEL/"

sed -i "$INSTALL_PATH/docker/elastalert/rules/elastrules.error.yaml" "s/{{SLACK_KEY}}/$SWARM_SLACK_KEY/"
sed -i "$INSTALL_PATH/docker/elastalert/rules/elastrules.error.yaml" "s/{{SLACK_CHANNEL}}/$SWARM_SLACK_CHANNEL/"


docker stack rm swarm
docker stack deploy --compose-file "$INSTALL_PATH/config/docker/stack.yml" --with-registry-auth swarm
