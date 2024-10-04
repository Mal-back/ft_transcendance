FROM hashicorp/vault:latest

COPY ./conf/config.hcl /vault/config/.

RUN mkdir -p /vault/certs

COPY certs/* /vault/certs

RUN mkdir -p /vault/data && chown -R vault:vault /vault/data
