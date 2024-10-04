#where we store our secrets, safer than our database (storage configuration)
storage "raft" {

    path = "./vault/data"
    node_id = "${VAULT_RAFT_NODE_ID}"

}

#listener config
listener "tcp" {

    address = "0.0.0.0:8200"
    #to comment when we'll be in https
    tls_disable = true

    #to uncomment when we'll be in https
    #tls_cert_file = "/vault/certs/vault.crt"
    #tls_cert_file = "/vault/certs/vault.key"

}

# API Address - Vault internal access
api_addr = "0.0.0.0:8200"

# Cluster Address - Optional (for multi-node clusters)
cluster_addr = "127.0.0.1:8201"

# Disable mlock on systems that do not support it (required for some Docker environments)
# disable_mlock = true

#to debug
log_level = "debug"