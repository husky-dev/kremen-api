#!/usr/bin/env sh
set -ex

mkdir -p /backup/redis
# Ask redis to create backup
redis-cli -h redis SAVE
redis-cli -h redis --rdb dump.rdb
mv dump.rdb /backup/redis/dump.rdb
# Create archive
tar -zcf /backup/redis-$(date +%Y%m%d-%H%M%S).tar.gz -C /backup redis
# Remove raw data
rm -rf /backup/redis
