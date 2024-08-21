# ft_transcendance

Before first run : 
    - run 'env_setup.sh' with the path to directory where a file named 'env' lives
    the script will generate all the ssl certificates at running time, you don't need to bother with them.
    - If you messed up the dockerfile, just delete it. A knew one will be automatically generated from dockerfile.yml.template (don't delete this one)
    - workspace api : It is transcendance/srcs/volumes/django. Source the myScript.sh in volumes if U need a virtual env. 
    - workspace frontend : transcendance/srcs/volumes/frontend.
    - Everithing is configured for hot reload, so you can.t juste run the docker and the change will appears on localhost:8080

