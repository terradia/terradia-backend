#!/bin/sh

# Get certs
certbot certonly -n -d api.terradia.eu \
  --standalone --preferred-challenges http --email contact@terradia.eu --agree-tos --expand

# Kick off cron
/usr/sbin/crond -f -d 8 &

# Start nginx
/usr/sbin/nginx -g "daemon off;"