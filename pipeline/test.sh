#!/usr/bin/env bash

set -x -e

app=source
(
npm install -g corepack@latest
corepack enable
corepack prepare pnpm@latest-10 --activate
pnpm config set store-dir ../../../root/.pnpm-store

cd ${app}

pnpm install --frozen-lockfile
pnpm build
pnpm test
)
