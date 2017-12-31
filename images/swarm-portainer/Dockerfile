FROM portainer/portainer:1.15.5 as portainer

FROM alpine:latest

COPY --from=portainer /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=portainer /public /public
COPY --from=portainer /portainer /portainer
COPY --from=portainer /docker /docker
RUN apk --no-cache --update upgrade && apk --no-cache add bash
RUN apk --no-cache --update upgrade && apk --no-cache add apache2-utils

VOLUME /data
WORKDIR /
EXPOSE 9000

COPY start.sh /

ENTRYPOINT []
CMD [ "bash", "-l", "/start.sh" ]