#!/bin/bash
jspm bundle-sfx src/export.js dist/jsCluster.js
jspm bundle-sfx src/export.js dist/jsCluster.min.js --minify
