FROM python:3.12.5-bullseye

ENV PYTHONUNBUFFERED=1 

RUN apt-get update && \
    apt-get update && \
    apt-get install -y cron
RUN mkdir -p /code
RUN mkdir -p /certs
RUN mkdir -p /init

COPY certs/* /certs
COPY init/* /init
COPY conf/my_crontab /etc/cron.d/my_crontab
COPY conf/wrapper.sh /wrapper.sh
RUN chmod 0644 /wrapper.sh
RUN chmod 0644 /etc/cron.d/my_crontab
RUN crontab /etc/cron.d/my_crontab

RUN mkdir -p /usr/local/share/ca-certificates
RUN cp /certs/ca.crt /usr/local/share/ca-certificates/ca.crt

RUN update-ca-certificates
WORKDIR /code
RUN cat /certs/ca.crt >>/etc/ssl/certs/ca-certificates.crt
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

ENTRYPOINT ["bash", "/init/init.sh"]
