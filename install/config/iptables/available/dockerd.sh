#!/usr/bin/env bash

IP_1=`cut -d'/' -f1 <<< \`ip -o addr show docker0 | awk '{print $4}'\``
IP_2=`cut -d'/' -f1 <<< \`ip -o addr show docker_gwbridge | awk '{print $4}'\``


# Allow docker ports

# Swarm ports
if [ "$IP_1" != "" ]; then
    iptables -A INPUT  -p tcp -d ${IP_1}/24 --dport 2376 -j ACCEPT
    iptables -A INPUT  -p tcp -d ${IP_1}/24 --dport 2377 -j ACCEPT
    iptables -A INPUT  -p tcp -d ${IP_1}/24 --dport 7946 -j ACCEPT
    iptables -A INPUT  -p udp -d ${IP_1}/24 --dport 7946 -j ACCEPT
    iptables -A INPUT  -p udp -d ${IP_1}/24 --dport 4789 -j ACCEPT
fi
if [ "$IP_2" != "" ]; then
    iptables -A INPUT  -p tcp -d ${IP_2}/24 --dport 2376 -j ACCEPT
    iptables -A INPUT  -p tcp -d ${IP_2}/24 --dport 2377 -j ACCEPT
    iptables -A INPUT  -p tcp -d ${IP_2}/24 --dport 7946 -j ACCEPT
    iptables -A INPUT  -p udp -d ${IP_2}/24 --dport 7946 -j ACCEPT
    iptables -A INPUT  -p udp -d ${IP_2}/24 --dport 4789 -j ACCEPT
fi

# Dockerd metrics
iptables -A INPUT  -p tcp -d "$IP_2" --dport 9323 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp -s "$IP_2" --sport 9323 -m state --state ESTABLISHED     -j ACCEPT
