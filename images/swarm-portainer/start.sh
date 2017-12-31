#!/bin/bash

HTPASSWD=`htpasswd -nb -B ${ADMIN_USERNAME} ${ADMIN_PASSWORD} | cut -d ":" -f 2`
HTPASSWD2=`htpasswd -nb -B admin adminadmin | cut -d ":" -f 2`
HTPASSWD3=`htpasswd -nb -B admin password | cut -d ":" -f 2`

echo "$HTPASSWD"
echo "$HTPASSWD2"
echo "$HTPASSWD3"

/portainer -H "unix:///var/run/docker.sock" --admin-password="'$HTPASSWD3'"
