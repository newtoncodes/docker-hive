FROM nginx

ENV NGINX_HOST=export-dockerd
ENV NGINX_PORT=9323
ENV HOST_IP="172.18.0.1"

COPY start.sh /
RUN chmod +x /start.sh
COPY config/nginx.conf /etc/nginx/nginx.conf

CMD [ "bash", "-l", "/start.sh" ]
