FROM prom/prometheus:v2.0.0

COPY start.sh /
COPY config /etc/prometheus/

ENTRYPOINT [ "/start.sh" ]
CMD [
    "--config.file=/etc/prometheus/prometheus.yml", \
    "--web.console.libraries=/etc/prometheus/console_libraries", \
    "--web.console.templates=/etc/prometheus/consoles", \
    "--storage.tsdb.path=/prometheus"
]
