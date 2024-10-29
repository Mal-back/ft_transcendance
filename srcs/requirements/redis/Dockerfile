FROM redis:5.0.4

COPY ./conf/redis.conf /etc/redis/redis.conf
COPY ./init/init_serv.sh /init/init_serv.sh

EXPOSE 6379

ENTRYPOINT [ "/bin/bash" ]
CMD [ "/init/init_serv.sh"]