#!/usr/bin/env bash

# Docker swarm ports

iptables -A INPUT -p tcp -i docker0 --dport 2376 -j ACCEPT
iptables -A INPUT -p tcp -i docker0 --dport 2377 -j ACCEPT
iptables -A INPUT -p tcp -i docker0 --dport 7946 -j ACCEPT
iptables -A INPUT -p udp -i docker0 --dport 7946 -j ACCEPT
iptables -A INPUT -p udp -i docker0 --dport 4789 -j ACCEPT

iptables -A INPUT -p tcp -i docker_gwbridge --dport 2376 -j ACCEPT
iptables -A INPUT -p tcp -i docker_gwbridge --dport 2377 -j ACCEPT
iptables -A INPUT -p tcp -i docker_gwbridge --dport 7946 -j ACCEPT
iptables -A INPUT -p udp -i docker_gwbridge --dport 7946 -j ACCEPT
iptables -A INPUT -p udp -i docker_gwbridge --dport 4789 -j ACCEPT

# Dockerd metrics

iptables -A INPUT  -p tcp -i docker_gwbridge --dport 9323 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp -i docker_gwbridge --sport 9323 -m state --state ESTABLISHED     -j ACCEPT
