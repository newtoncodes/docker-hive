#!/usr/bin/env bash

INSTALL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INSTALL_PATH="$INSTALL_PATH/..";


for f in ${INSTALL_PATH}/config/openvpn/enabled/*
do
  echo "Executing vpn config: $f"

  rm -rf "/etc/openvpn/$f"
  ln -s "$f" /etc/openvpn/

  systemctl start "openvpn@$f"
  systemctl status "openvpn@$f"
  systemctl enable "openvpn@$f"
done
