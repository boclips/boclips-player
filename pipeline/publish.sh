#!/usr/bin/env bash

set -x -e

app=source
(
cd ${app}
npm ci

npm run build
npm --no-git-tag-version -f version "$(< ../version/version)"
)

cp -R ${app}/dist/ ${app}/package.json ${app}/README.md dist/
