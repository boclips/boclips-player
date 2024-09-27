#!/usr/bin/env bash

set -x -e

app=source
(
corepack enable
corepack prepare pnpm@latest-9 --activate
pnpm config set store-dir ../../../root/.pnpm-store

cd ${app}

pnpm install --frozen-lockfile
pnpm run build
pnpm run test
)
