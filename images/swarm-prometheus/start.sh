#!/bin/sh -e

if [ ${JOBS+x} ]; then

for job in $JOBS
do

HOST=$(echo "$job" | cut -d":" -f1)
PORT=$(echo "$job" | cut -d":" -f2)

cat >>/etc/prometheus/prometheus.yml <<EOF

  - job_name: '${HOST}'
    dns_sd_configs:
    - names:
      - 'tasks.${HOST}'
      type: 'A'
      port: ${PORT}
EOF

done

fi


/bin/prometheus \
 --config.file="/etc/prometheus/prometheus.yml" \
 --web.console.libraries="/etc/prometheus/console_libraries" \
 --web.console.templates="/etc/prometheus/consoles" \
 --storage.tsdb.path="/prometheus"