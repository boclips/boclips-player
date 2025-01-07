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

if [[ ! ${version} =~ "dev" && -z $(grep -F "## [${version}]" ${app}/CHANGELOG.md) ]]; then
    echo "Changelog does not have an entry for this version"
    exit 1
fi

$npm ci
$npm run build
$npm version "$version" \
    --no-git-tag-version \
    --force

cp -R ${app}/dist/ ${app}/package.json ${app}/README.md dist/
