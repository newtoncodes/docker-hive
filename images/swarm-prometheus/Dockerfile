FROM prom/prometheus:v2.0.0

COPY start.sh /
COPY config /etc/prometheus/
RUN chown -R nobody:nogroup /etc/prometheus /prometheus
RUN chown -R nobody:nogroup /start.sh

USER nobody

ENTRYPOINT []
CMD [ "sh", "-l", "/start.sh" ]
