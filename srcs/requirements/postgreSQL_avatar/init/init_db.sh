#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf
mv /etc/psql.conf/postgresql.conf /var/lib/postgresql/data/postgresql.conf

psql -U postgres -c "CREATE DATABASE ${MATCHMAKING_DB_NAME};"
psql -U postgres -c "CREATE USER ${MATCHMAKING_DB_USER} WITH ENCRYPTED PASSWORD '${MATCHMAKING_DB_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${MATCHMAKING_DB_NAME} TO ${MATCHMAKING_DB_USER};"
psql -U postgres -c "ALTER DATABASE ${MATCHMAKING_DB_NAME} OWNER TO ${MATCHMAKING_DB_USER};"
echo $MATCHMAKING_DB_NAME $MATCHMAKING_DB_USER $MATCHMAKING_DB_PASSWORD
