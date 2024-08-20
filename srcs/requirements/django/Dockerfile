FROM python:3.12.5

ENV PYTHONUNBUFFERED=1 

RUN mkdir -p /code
RUN mkdir -p /certs
COPY certs/* /certs

WORKDIR /code

ENTRYPOINT ["bash", "init.sh"]
