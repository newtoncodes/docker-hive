#!/bin/sh -e

NODE_NAME=$(cat /etc/nodename)
echo "node_meta{node_id=\"$NODE_ID\", container_label_com_docker_swarm_node_id=\"$NODE_ID\", node_name=\"$NODE_NAME\"} 1" > /etc/node-exporter/node-meta.prom

/bin/node_exporter \
  --collector.textfile.directory="/etc/node-exporter/" \
  --path.procfs="/host/proc" \
  --path.sysfs="/host/sys" \
  --collector.filesystem.ignored-mount-points="^/(sys|proc|dev|host|etc)($$|/)" \
  --collector.textfile \
  --collector.conntrack \
  --collector.diskstats \
  --collector.entropy \
  --collector.filefd \
  --collector.filesystem \
  --collector.loadavg \
  --collector.mdadm \
  --collector.meminfo \
  --collector.netdev \
  --collector.netstat \
  --collector.stat \
  --collector.time \
  --collector.vmstat

