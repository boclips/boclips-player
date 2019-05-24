#!/usr/bin/env bash

set -x -e

app=source
(
cd ${app}
npm ci

npm run build
npm -f version "$(< ../version/version)"
git push --tags origin master
)

cp -R ${app}/dist/ ${app}/lib/ ${app}/esm/ ${app}/package.json ${app}/README.md dist/
