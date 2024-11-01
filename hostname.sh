#!/bin/bash

# Get the hostname
HOSTNAME_VALUE=$(hostname)

# Define the env file path
ENV_FILE="env"

# Check if the third line contains HOSTNAME, and update or add it
if sed -n '3p' "$ENV_FILE" | grep -q "^HOSTNAME="; then
    # Replace the third line if it contains HOSTNAME
    sed -i "3s|^HOSTNAME=.*|HOSTNAME=$HOSTNAME_VALUE|" "$ENV_FILE"
else
    # Insert HOSTNAME on the third line if it doesn't exist
    sed -i "3i HOSTNAME=$HOSTNAME_VALUE" "$ENV_FILE"
fi

