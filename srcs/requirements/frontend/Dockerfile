FROM nginx:1.27.1

COPY ./conf/nginx.server.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/certs
RUN mkdir -p /var/www/myfront

COPY ./certs/* /etc/nginx/certs

RUN rm -rf /etc/nginx/sites-enabled/default
RUN chown -R www-data:www-data var/www/myfront/ 

ENTRYPOINT ["nginx", "-g", "daemon off;"]
