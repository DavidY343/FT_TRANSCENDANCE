#!/bin/sh
set -e

if [ ! -f /etc/ssl/certs/nginx-selfsigned.crt ]; then
  echo "Generating self-signed certificate..."
  mkdir -p /etc/ssl/private /etc/ssl/certs
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=ES/ST=Madrid/L=Madrid/O=42/OU=42/CN=localhost"
fi

exec nginx -g 'daemon off;'
