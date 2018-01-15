#!/bin/bash

echo "Installing..."

set -e

dir=$(dirname "$0")

sudo cp -f ${dir}/init.sh /etc/init.d/docker-hive
sudo chmod +x /etc/init.d/docker-hive

set +e

res=$(which chkconfig)

set -e

if [ "$res" != "" ]; then
    sudo chkconfig --add docker-hive
    sudo chkconfig --level 2345 docker-hive on
else
    sudo update-rc.d docker-hive defaults
fi
