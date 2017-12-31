#!/bin/bash

HTPASSWD=`htpasswd -nb -B "$ADMIN_USERNAME" "$ADMIN_PASSWORD" | cut -d ":" -f 2`

/portainer -H "unix:///var/run/docker.sock" --admin-password="$ADMIN_USERNAME:$HTPASSWD"
