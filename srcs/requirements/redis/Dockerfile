FROM redis:8.0-debian

# COPY ./conf/redis.conf /etc/redis/redis.conf

EXPOSE 6379

ENTRYPOINT [ "redis-server" ]
CMD [ "/etc/redis/redis.conf", "--requirepass", "${REDIS_PASSWORD}"]