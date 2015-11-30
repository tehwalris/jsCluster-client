#!/bin/bash
nodemon -w src -x "jspm bundle-sfx src/export.js dist/jsCluster.js; cp dist/jsCluster.js ../jsCluster-demo/bower_components/jsCluster-client/index.js; touch ../jsCluster-demo/src/index.html"
