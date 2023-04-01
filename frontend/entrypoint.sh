#!/bin/sh

[ ! -d "node_modules" ] && npm install
npm run build

nginx -g 'daemon off;'
