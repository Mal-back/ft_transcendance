FROM python:3.12.5

ENV PYTHONUNBUFFERED=1 

RUN mkdir -p /code
RUN mkdir -p /certs
RUN mkdir -p /init

COPY certs/* /certs
COPY init/* /init

RUN mkdir -p /usr/local/share/ca-certificates

RUN cp /certs/ca.crt /usr/local/share/ca-certificates/ca.crt

RUN update-ca-certificates

WORKDIR /code

ENTRYPOINT ["bash", "/init/init.sh"]
