#!/usr/bin/env bash

## See https://stackoverflow.com/a/50402065/24856201

set -e;

if [ "$SKIP_NPM_POSTINSTALL" == "y" ]; then
  echo "skipping your package's postinstall routine.";
  exit 0;
fi

# Actual postinstall command
quasar prepare
