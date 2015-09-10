#!/bin/env bash

# stop
docker stop message-service;
docker stop message-crossbar;
docker stop message-db;

# clean
docker rm message-test;
docker rm message-service;
docker rm message-crossbar;
docker rm message-db;

# uninstall
docker rmi message-test;
docker rmi message-service;
docker rmi message-crossbar;
docker rmi message-base;
