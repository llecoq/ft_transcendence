#!/bin/sh

rm -rf node_modules
[ ! -d "node_modules" ] && npm install
npm run build
npm run start:prod
