#!/usr/bin/env bash

IP_EXTERNAL="172.18.0.1"


# SSH to a specific IP
iptables -A INPUT  -p tcp -d "$IP_EXTERNAL" --dport 9323 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp -s "$IP_EXTERNAL" --sport 9323 -m state --state ESTABLISHED     -j ACCEPT
