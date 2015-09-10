#!/bin/bash
cat > tasks/deploy/message-controller.yml <<EOF

apiVersion: v1
kind: ReplicationController
metadata:
  name: message
  labels:
    name: message
    branch: ${CIRCLE_BRANCH}
spec:
  replicas: ${REPLICAS_NUMBER}
  # selector identifies the set of pods that this
  # replication controller is responsible for managing
  selector:
    name: message
    branch: ${CIRCLE_BRANCH}
  # template defines the 'cookie cutter' used for creating
  # new pods when necessary
  template:
    metadata:
      labels:
        # Important: these labels need to match the selector above
        # The api server enforces this constraint.
        name: message
        branch: ${CIRCLE_BRANCH}
    spec:
      containers:
      - name: message
        command: ["npm", "start", "--"]
        args: ["--ws-url", "ws://crossbar-private:8081", "--db-host", "memsql"]
        image: eu.gcr.io/saio-fr/message:${CIRCLE_BRANCH}.${CIRCLE_SHA1}
        ports:
        - containerPort: 8081

EOF
