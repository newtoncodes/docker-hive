FROM prom/node-exporter:v0.15.2

ENV NODE_ID=none
ENV NODE_NAME=none

COPY start.sh /

USER root

COPY start.sh /
RUN mkdir -p /etc/node-exporter
RUN chown -R nobody:nogroup /etc/node-exporter
RUN chown -R nobody:nogroup /start.sh

USER nobody

ENTRYPOINT []
CMD [ "sh", "-l", "/start.sh" ]
