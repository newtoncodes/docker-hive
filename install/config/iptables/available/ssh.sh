#!/usr/bin/env bash

IP_EXTERNAL=`dig +short myip.opendns.com @resolver1.opendns.com`
IP_SSH_REMOTE="{{IP_SSH_REMOTE}}"


# SSH to a specific IP
iptables -A INPUT  -p tcp -s "$IP_SSH_REMOTE" -d "$IP_EXTERNAL" --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp -s "$IP_EXTERNAL" -d "$IP_SSH_REMOTE" --sport 22 -m state --state ESTABLISHED     -j ACCEPT