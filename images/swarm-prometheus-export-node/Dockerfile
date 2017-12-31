FROM prom/node-exporter:v0.15.2

ENV NODE_ID=none
ENV NODE_NAME=none

COPY start.sh /
COPY config /etc/node-exporter

CMD [ "bash", "-l", "/start.sh" ]

CMD [ "--collector.textfile.directory=/etc/node-exporter/", \
      "--path.procfs=/host/proc", \
      "--path.sysfs=/host/sys", \
      "--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)", \
      "--collector.textfile", \
      "--collector.conntrack", \
      "--collector.diskstats", \
      "--collector.entropy", \
      "--collector.filefd", \
      "--collector.filesystem", \
      "--collector.loadavg", \
      "--collector.mdadm", \
      "--collector.meminfo", \
      "--collector.netdev", \
      "--collector.netstat", \
      "--collector.stat", \
      "--collector.time", \
      "--collector.vmstat" \
]
