#!/bin/sh -e

sed -i "s@{{HOST_IP}}@$HOST_IP@" /etc/nginx/nginx.conf

nginx