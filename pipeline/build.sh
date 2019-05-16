#!/usr/bin/env bash

set -x -e

app=source
(
cd ${app}

npm ci
npm run audit
npm run compile
npm run test
)