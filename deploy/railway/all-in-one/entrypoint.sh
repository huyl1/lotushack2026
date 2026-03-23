#!/bin/sh
set -e

if [ -z "${PORT}" ]; then
  echo "PORT is required (Railway sets this)" >&2
  exit 1
fi

cd /app

# Valsea — own port only (Railway PORT is for nginx)
PORT=8765 VALSEA_PROXY_HOST=0.0.0.0 node /app/scripts/valsea-ws-proxy.mjs &

# Next.js standalone — internal port 3000
HOSTNAME=0.0.0.0 PORT=3000 node /app/server.js &

sed "s/__RAILWAY_PORT__/${PORT}/g" < /app/deploy/railway/all-in-one/nginx.conf.template > /tmp/nginx-main.conf

exec nginx -c /tmp/nginx-main.conf -g 'daemon off;'
