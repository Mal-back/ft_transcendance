FROM python:3.12.5

ENV PYTHONUNBUFFERED=1 

RUN mkdir -p /code
RUN mkdir -p /certs
RUN mkdir -p /init

COPY certs/* /certs
COPY init/* /init

WORKDIR /code

ENTRYPOINT ["bash", "/init/init.sh"]
