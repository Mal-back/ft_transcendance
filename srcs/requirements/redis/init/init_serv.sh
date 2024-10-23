#!/bin/bash

exec redis-server /etc/redis/redis.conf --requirepass $REDIS_PASSWORD