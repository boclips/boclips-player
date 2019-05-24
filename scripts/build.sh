#!/usr/bin/env bash

set -x

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Produce the ES5/CommonJS into /lib
tsc

# Produce the ES6/ESModule into /esm
tsc --target ES6 --outDir esm

# Produce the bundled ES5 into /dist
webpack

# Copy the LESS assets out into /lib

SRC=$SCRIPT_DIR/../src
LIB=$SCRIPT_DIR/../lib
ESM=$SCRIPT_DIR/../esm

# cd to src so it doesn't appear in the find output
cd $SRC

LESS_FILES=$(find . -name \*.less)

for FILE in $LESS_FILES; do
    DIR_PATH=$(dirname $FILE)

    mkdir -p $LIB/$DIR_PATH
    cp $FILE $LIB/$FILE

    mkdir -p $ESM/$DIR_PATH
    cp $FILE $ESM/$FILE
done
