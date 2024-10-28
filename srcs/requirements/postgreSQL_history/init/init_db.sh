#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf
mv /etc/psql.conf/postgresql.conf /var/lib/postgresql/data/postgresql.conf

psql -U postgres -c "CREATE DATABASE ${HISTORY_DB_NAME};"
psql -U postgres -c "CREATE USER ${HISTORY_DB_USER} WITH ENCRYPTED PASSWORD '${HISTORY_DB_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${HISTORY_DB_NAME} TO ${HISTORY_DB_USER};"
psql -U postgres -c "ALTER DATABASE ${HISTORY_DB_NAME} OWNER TO ${HISTORY_DB_USER};"

echo $HISTORY_DB_PASSWORD
