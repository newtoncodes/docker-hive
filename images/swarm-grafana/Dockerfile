FROM grafana/grafana:4.6.3

COPY start.sh /
COPY datasources /etc/grafana/datasources/
COPY dashboards /etc/grafana/dashboards_system/
RUN mkdir /etc/grafana/dashboards

ENV GF_SECURITY_ADMIN_PASSWORD=admin
ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_USERS_ALLOW_SIGN_UP=false

ENTRYPOINT []
CMD ["bash", "-l", "/start.sh"]
