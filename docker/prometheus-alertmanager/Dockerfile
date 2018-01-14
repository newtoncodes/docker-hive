FROM prom/alertmanager:v0.12.0

ENV SLACK_KEY=""
ENV SLACK_CHANNEL=""
ENV SLACK_USERNAME=""

COPY start.sh /
COPY config /etc/alertmanager/

ENTRYPOINT []
CMD [ "sh", "-l", "/start.sh" ]

