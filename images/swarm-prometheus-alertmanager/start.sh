#!/bin/sh -e

cat /etc/alertmanager/alertmanager.yml | \
    sed "s@{{SLACK_KEY}}@$SLACK_KEY@" | \
    sed "s@{{SLACK_CHANNEL}}@$SLACK_CHANNEL@" | \
    sed "s@{{SLACK_USERNAME}}@$SLACK_USERNAME@" \
> /tmp/alertmanager.yml

mv /tmp/alertmanager.yml /etc/alertmanager/alertmanager.yml
rm -rf /tmp/alertmanager.yml

set -- /bin/alertmanager "$@"

exec "$@"
