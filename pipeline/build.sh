#!/usr/bin/env bash

set -x -e

app=source
(
cd ${app}

npm audit --audit-level moderate
npm ci
npm run compile
npm run test
)