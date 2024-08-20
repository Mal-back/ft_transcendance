FROM nginx:1.27.1

RUN apt update && apt upgrade && apt install -y openssl nginx

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/ssl
RUN mkdir -p /etc/nginx/certs
COPY ./certs/django.crt /etc/nginx/certs
RUN rm -rf /etc/nginx/sites-enabled/default

RUN openssl req -nodes -x509 -sha256 -out /etc/nginx/ssl/inception.crt -keyout /etc/nginx/ssl/inception.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=vlevy.42.fr/UID=vlevy" 

EXPOSE 8443
ENTRYPOINT ["nginx", "-g", "daemon off;"]
