#!/bin/sh -e

NODE_NAME=$(cat /etc/nodename)
echo "node_meta{node_id=\"$NODE_ID\", container_label_com_docker_swarm_node_id=\"$NODE_ID\", node_name=\"$NODE_NAME\"} 1" > /etc/node-exporter/node-meta.prom

/bin/node_exporter \
 --collector.textfile.directory="/etc/node-exporter/" \
 --collector.procfs="/host/proc" \
 --collector.sysfs="/host/sys" \
 --collector.filesystem.ignored-mount-points="^/(sys|proc|dev|host|etc)($$|/)" \
 --collectors.enabled="textfile,conntrack,diskstats,entropy,filefd,filesystem,loadavg,mdadm,meminfo,netdev,netstat,stat,time,vmstat" \
