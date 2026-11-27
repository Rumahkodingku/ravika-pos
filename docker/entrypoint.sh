#!/bin/sh
set -eu

mkdir -p /app/data/backups
chown -R nextjs:nodejs /app/data

exec gosu nextjs:nodejs "$@"
