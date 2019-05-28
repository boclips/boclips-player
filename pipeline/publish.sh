#!/usr/bin/env bash

set -x -e

app=source
release_name="v$(< version/version)"
echo "$release_name" \
    > release/name
echo "This is $release_name" \
    > release/notes
(
cd ${app}
npm ci
npm run build
npm version "$(< ../version/version)" \
    --no-git-tag-version \
    --force
)

cp -R ${app}/dist/ ${app}/lib/ ${app}/esm/ ${app}/package.json ${app}/README.md dist/
