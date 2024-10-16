#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf
mv /etc/psql.conf/postgresql.conf /var/lib/postgresql/data/postgresql.conf

psql -U postgres -c "CREATE DATABASE ${AVATAR_DB_NAME};"
psql -U postgres -c "CREATE USER ${AVATAR_DB_USER} WITH ENCRYPTED PASSWORD '${AVATAR_DB_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${AVATAR_DB_NAME} TO ${AVATAR_DB_USER};"
psql -U postgres -c "ALTER DATABASE ${AVATAR_DB_NAME} OWNER TO ${AVATAR_DB_USER};"
echo $AVATAR_DB_NAME $AVATAR_DB_USER $AVATAR_DB_PASSWORD
