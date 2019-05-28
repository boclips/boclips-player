#!/usr/bin/env bash

set -x -e

app=source
release_name="v$(< version/version)"
(
cd ${app}
npm ci

npm run build
npm version "$(< ../version/version)" \
    --no-git-tag-version \
    --force
echo "$release_name" \
    > release/name
echo "This is $release_name" \
    > release/notes
)

cp -R ${app}/dist/ ${app}/lib/ ${app}/esm/ ${app}/package.json ${app}/README.md dist/
