FROM prom/node-exporter:v0.15.2

ENV NODE_ID=none
ENV NODE_NAME=none

COPY start.sh /

ENTRYPOINT  [ "/start.sh" ]
CMD [
    "-collector.textfile.directory=/etc/node-exporter/", \
    "-collector.procfs=/host/proc", \
    "-collector.sysfs=/host/sys", \
    "-collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)", \
    "-collectors.enabled=textfile,conntrack,diskstats,entropy,filefd,filesystem,loadavg,mdadm,meminfo,netdev,netstat,stat,time,vmstat"
]
