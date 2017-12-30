#!/usr/bin/env bash

INSTALL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INSTALL_PATH="$INSTALL_PATH/../";


# Clear.
iptables -F
iptables -X

# Intended outgoing connections.
iptables -A OUTPUT -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT  -m state --state ESTABLISHED -j ACCEPT

# Default drop all policy.
iptables -P INPUT DROP
iptables -P OUTPUT DROP
iptables -P FORWARD DROP

# All localhost.
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Log spam
iptables -A INPUT -p udp -j LOG --log-prefix "UDP-SPAM " --log-ip-options -m limit --limit 1/m --limit-burst 1
iptables -A INPUT -p tcp -j LOG --log-prefix "TCP-SPAM " --log-ip-options -m limit --limit 1/m --limit-burst 1


for f in ${INSTALL_PATH}/config/iptables/enabled/*
do
  echo "Executing iptables config: $f"
  source ${f};
done


# Drop by default.
iptables -A INPUT   -j DROP
iptables -A OUTPUT  -j ACCEPT
iptables -A FORWARD -j DROP


# iptables-save > /etc/iptables/rules.v4
/etc/init.d/iptables save
