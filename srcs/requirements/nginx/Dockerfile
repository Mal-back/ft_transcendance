FROM nginx:1.27.1

COPY ./conf/nginx.proxy.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/ssl

RUN mkdir -p /etc/nginx/certs

RUN mkdir -p /var/www/static
RUN mkdir -p /var/www/media

RUN chown -R www-data:www-data var/www/static/ 

COPY ./certs/* /etc/nginx/certs

RUN rm -rf /etc/nginx/sites-enabled/default

ENTRYPOINT ["nginx", "-g", "daemon off;"]
