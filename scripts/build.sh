#!/usr/bin/env bash

set -x

# Produce the ES5/CommonJS into /lib
tsc

# Produce the ES6/ESModule into /esm
tsc --target ES6 --outDir esm

# Produce the bundled ES5 into /dist
webpack

# Copy the LESS assets out into /lib

SRC=src
LIB=lib

cd $SRC

LESS_FILES=$(find . -name \*.less)

for FILE in $LESS_FILES; do
    DIR_PATH=$(dirname $FILE)
    mkdir -p $LIB/$DIR_PATH
    cp $FILE $LIB/$FILE
done