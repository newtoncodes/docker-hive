#!/usr/bin/env bash

IP_VPN="{{IP_VPN}}"


# ALL to admin network
iptables -A INPUT  -p tcp -d "$IP_VPN" -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp -s "$IP_VPN" -m state --state ESTABLISHED     -j ACCEPT
