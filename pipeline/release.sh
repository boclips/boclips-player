#!/usr/bin/env bash

set -x -e

app=source
version="$(< version/version)"
release_name="v$version"
echo "$release_name" \
    > release/name
echo "This is $release_name" \
    > release/notes
npm="npm --prefix $app"

version=1.0.3

if [[ -z $(grep -F "## [${version}]" ${app}/CHANGELOG.md) ]]; then
    echo "Changelog does not have an entry for this version"
    exit 1
fi

$npm ci
$npm run build
$npm version "$version" \
    --no-git-tag-version \
    --force

cp -R ${app}/dist/ ${app}/lib/ ${app}/esm/ ${app}/package.json ${app}/README.md dist/
