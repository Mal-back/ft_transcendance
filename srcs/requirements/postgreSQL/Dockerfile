FROM postgres:16.4

RUN mkdir -p /docker-entrypoint-initdb

COPY ./init/init_db.sh /docker-entrypoint-initdb.d/init_db.sh
