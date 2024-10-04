FROM nginx:1.27.1

RUN cp /etc/nginx/nginx.conf /etc/nginx/nginx_check.conf

COPY ./conf/nginx.proxy.conf /etc/nginx/nginx.conf

RUN apt-get update && apt-get install -y \
    git g++ wget apt-utils autoconf automake build-essential libcurl4-openssl-dev libgeoip-dev liblmdb-dev libpcre2-dev libtool libxml2-dev libyajl-dev pkgconf zlib1g-dev

RUN mkdir -p /etc/nginx/ssl

RUN mkdir -p /etc/nginx/certs

RUN mkdir -p /var/www/static

RUN chown -R www-data:www-data var/www/static/ 

COPY ./certs/* /etc/nginx/certs

RUN rm -rf /etc/nginx/sites-enabled/default

RUN git clone --recursive https://github.com/owasp-modsecurity/ModSecurity /ModSecurity

WORKDIR /ModSecurity

RUN git submodule init \
    && git submodule update \
    && sh ./build.sh \
    && ./configure --with-pcre2\
    && make \
    && make install

RUN mkdir /usr/local/src/cpg

WORKDIR /usr/local/src/cpg

RUN wget http://nginx.org/download/nginx-1.27.1.tar.gz \
    && tar -xvzf nginx-1.27.1.tar.gz \
    && git clone https://github.com/SpiderLabs/ModSecurity-nginx

WORKDIR /usr/local/src/cpg/nginx-1.27.1

RUN ./configure --with-compat --with-openssl=/usr/include/openssl/ --add-dynamic-module=/usr/local/src/cpg/ModSecurity-nginx \
    && make modules \
    && cp objs/ngx_http_modsecurity_module.so /usr/lib/nginx/modules/ \
    && mkdir /etc/nginx/modules-enabled/ 

COPY ./conf/nginx-modsecurity.conf /etc/nginx/modules-enabled/nginx-modsecurity.conf
COPY ./conf/cpguard_waf_load.conf /etc/nginx/cpguard_waf_load.conf

RUN git clone https://github.com/coreruleset/coreruleset /etc/nginx/modsec-crs

COPY ./conf/crs-setup.conf /etc/nginx/modsec-crs/crs-setup.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
