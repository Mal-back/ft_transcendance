#!/bin/bash
psql -U postgres -c "CREATE DATABASE ${DB_NAME};"
psql -U postgres -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
psql -U postgres -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};"
