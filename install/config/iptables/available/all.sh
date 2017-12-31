#!/usr/bin/env bash

IP_ALL="{{IP_ALL}}"


# ALL to admin network
iptables -A INPUT  -p tcp -d "$IP_ALL" -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp -s "$IP_ALL" -m state --state ESTABLISHED     -j ACCEPT
