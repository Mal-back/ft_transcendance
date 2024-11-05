FROM postgres:16.4

RUN mkdir -p /docker-entrypoint-initdb
RUN mkdir -p /etc/psql.conf
RUN mkdir -p /certs

COPY ./init/init_db.sh /docker-entrypoint-initdb.d/init_db.sh
COPY ./conf/pg_hba.conf /etc/psql.conf/pg_hba.conf
COPY ./conf/postgresql.conf /etc/psql.conf/postgresql.conf
COPY ./certs/* /certs

RUN chown -R postgres:postgres /etc/psql.conf
RUN chown -R postgres:postgres /certs/
