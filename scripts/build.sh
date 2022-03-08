#!/usr/bin/env bash

set -xe

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SRC=$SCRIPT_DIR/../src
LIB=$SCRIPT_DIR/../lib
ESM=$SCRIPT_DIR/../esm

# Produce the ES5/CommonJS into /lib
tsc --target ES5 --outDir $LIB

# Produce the ES6/ESModule into /esm
tsc --target ES6 --outDir $ESM

# Produce the bundled ES5 into /dist
webpack

# Copy the LESS assets out into /lib


# cd to src so it doesn't appear in the find output
cd $SRC

ASSET_FILES=$(find ./ -type f \( -iname \*.less -o -iname \*.scss \))

for FILE in $ASSET_FILES; do
    DIR_PATH=$(dirname $FILE)

    mkdir -p $LIB/$DIR_PATH
    cp $FILE $LIB/$FILE

    mkdir -p $ESM/$DIR_PATH
    cp $FILE $ESM/$FILE
done
