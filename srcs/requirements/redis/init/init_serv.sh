#!/bin/bash
echo never > /sys/kernel/mm/transparent_hugepage/enabled
exec redis-server /etc/redis/redis.conf --requirepass $REDIS_PASSWORD