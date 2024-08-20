#!/bin/bash

FILE='./srcs/docker-compose.yml'

if [ ! -f $FILE ]; then
	cp $FILE.bak $FILE;
	sed -i "s|placeholder|$PWD|g" $FILE
fi
