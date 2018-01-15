#!/bin/bash
### BEGIN INIT INFO
# Provides:          docker-hive
# Required-Start:    $local_fs $network
# Required-Stop:     $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: docker-hive
# Description:       docker-hive
### END INIT INFO

ENV_PATH=/etc/docker-hive/env.conf

start() {
    if [ ! -f "$ENV_PATH" ]; then
        echo "Not connected to swarm. Please run hive init or hive join first.";
        exit 1;
    fi

    source ${ENV_PATH}

    echo "Starting $type..."

    local pid=

    if [ "$type" = "master" ]; then
        pid=$(ps ax | grep docker-hive | grep serve | awk '{print $1}')
    else
        pid=$(ps ax | grep docker-hive | grep sync | awk '{print $1}')
    fi

    if [ "$pid" != "" ]; then
        echo "Already started.";
        exit 1;
    fi

    if [ "$type" = "master" ]; then
        nohup docker-hive serve < /dev/null >> /var/log/docker-hive-serve.log 2>&1 &
    else
        nohup docker-hive sync < /dev/null >> /var/log/docker-hive-sync.log 2>&1 &
    fi

    echo "Started."
}

stop() {
    if [ ! -f "$ENV_PATH" ]; then
        echo "Not connected to swarm. Please run hive init or hive join first.";
        exit 1;
    fi

    source ${ENV_PATH}

    echo "Stopping $type..."

    local pid=

    if [ "$type" = "master" ]; then
        pid=$(ps ax | grep docker-hive | grep serve | awk '{print $1}')
    else
        pid=$(ps ax | grep docker-hive | grep sync | awk '{print $1}')
    fi

    if [ "$pid" = "" ]; then
        echo "Not started.";
        exit 1;
    fi

    kill -9 ${pid}

    echo "Stopped."
}

status() {
    if [ ! -f "$ENV_PATH" ]; then
        echo "Not connected to swarm. Please run hive init or hive join first.";
        exit 1;
    fi

    source ${ENV_PATH}

    local pid=

    if [ "$type" = "master" ]; then
        pid=$(ps ax | grep docker-hive | grep serve | awk '{print $1}')
    else
        pid=$(ps ax | grep docker-hive | grep sync | awk '{print $1}')
    fi

    if [ "$pid" != "" ]; then
        echo "Running."
    else
        echo "Dead."
    fi
}

case "$1" in
    start)
       start
       ;;
    stop)
       stop
       ;;
    restart)
       stop
       start
       ;;
    status)
        status
       ;;
    *)
       echo "Usage: $0 {start|stop|status|restart}"
esac

exit 0