#!/bin/sh -e

cat /etc/alertmanager/alertmanager.yml | \
    sed "s^{{SLACK_KEY}}^$SLACK_KEY^" | \
    sed "s^{{SLACK_CHANNEL}}^$SLACK_CHANNEL^" | \
    sed "s^{{SLACK_USERNAME}}^$SLACK_USERNAME^" \
> /tmp/alertmanager.yml

rm -rf /etc/alertmanager/alertmanager.yml
mv /tmp/alertmanager.yml /etc/alertmanager/alertmanager.yml


/bin/alertmanager --config.file="/etc/alertmanager/alertmanager.yml" --storage.path="/alertmanager"