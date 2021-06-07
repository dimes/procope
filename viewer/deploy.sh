#!/usr/bin/env zsh

# -euxo for command output
set -euo pipefail

MAIN_DIR="${0:A:h}"
BUILD_DIR="$MAIN_DIR/dist"

rm -rf $BUILD_DIR
cd $MAIN_DIR && npm run build-prod

function uploadFiles {
  PIDS=()
  for FILE in "$@"; do
    if [ -d "$BUILD_DIR/$FILE" ]; then
      continue
    fi

    CACHE_HEADER=""
    if [[ $FILE == *.html ]]; then
      CACHE_HEADER="public, must-revalidate, proxy-revalidate, max-age=0"
    else
      CACHE_HEADER="max-age=3600, s-maxage=259200"
    fi

    aws s3 cp --acl public-read --cache-control "$CACHE_HEADER" "$BUILD_DIR/$FILE" "s3://procope/$FILE" &
    PID=$!
    PIDS+=$PID
    
  done

  for PID in $PIDS; do
    wait "$PID"
  done
}

# Upload non-html files before html files
NON_HTML_FILES=($(cd "$BUILD_DIR" && find . -not -name "*.html" | sed -e 's,^\./,,'))
HTML_FILES=($(cd "$BUILD_DIR" && find . -name "*.html" | sed -e 's,^\./,,'))

uploadFiles $NON_HTML_FILES
uploadFiles $HTML_FILES