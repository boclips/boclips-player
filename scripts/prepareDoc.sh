#!/bin/bash -x


SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SRC=${SCRIPT_DIR}/../src
DOCS=${SCRIPT_DIR}/../docs

DEST=$1

while read -r FILEPATH; do
    FILE=${FILEPATH##*/}
    cp $FILEPATH $DEST/$FILE
done < <(grep -lr tag:: ${SRC} | uniq)


cp ${DOCS}/* ${DEST}



