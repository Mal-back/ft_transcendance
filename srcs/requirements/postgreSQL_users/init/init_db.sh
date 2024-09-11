#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf
mv /etc/psql.conf/postgresql.conf /var/lib/postgresql/data/postgresql.conf

psql -U postgres -c "CREATE DATABASE ${USERS_DB_NAME};"
psql -U postgres -c "CREATE USER ${USERS_DB_USER} WITH ENCRYPTED PASSWORD '${USERS_DB_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${USERS_DB_NAME} TO ${USERS_DB_USER};"
psql -U postgres -c "ALTER DATABASE ${USERS_DB_NAME} OWNER TO ${USERS_DB_USER};"
