#!/usr/bin/env sh
set -ex

mkdir -p /backup

tar -zcf /backup/ssl-$(date +%Y%m%d-%H%M%S).tar.gz -C /var/data/ ssl
