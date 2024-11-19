#!/bin/bash

source /etc/env.txt;
env > /env_test.log;
python3 /code/manage.py delete_old_accounts >> /old_accounts.log 2>&1;
