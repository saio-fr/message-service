#!/bin/env bash

# install
docker build -t message-base -f tasks/integration/dockerfiles/baseDockerfile .;
docker build -t message-crossbar -f tasks/integration/dockerfiles/crossbarDockerfile .;
docker build -t message-service -f tasks/integration/dockerfiles/messageDockerfile .;
docker build -t message-test -f tasks/integration/dockerfiles/testDockerfile .;

# start services
echo "starting database...";
docker run -d \
	--name message-db \
	-e POSTGRES_PASSWORD=test \
	postgres;
sleep 4;

echo "starting crossbar...";
docker run -d \
  --name message-crossbar \
  message-crossbar;
sleep 4;

echo "starting message service...";
docker run -d \
  --name message-service \
  --link message-db:db \
  --link message-crossbar:crossbar \
  message-service;
sleep 4;

echo "running test...";
docker run \
  --name message-test \
  --link message-db:db \
  --link message-crossbar:crossbar \
  message-test;
TEST_EC=$?;

# return with the exit code of the test
if [ $TEST_EC -eq 0 ]
then
  echo "It Saul Goodman !";
  exit 0;
else
  exit $TEST_EC;
fi
