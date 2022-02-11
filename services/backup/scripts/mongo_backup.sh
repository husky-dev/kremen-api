#!/usr/bin/env sh
set -ex

mkdir -p /backup/mongo
# Dump mongodb to /backup/mongo
mongodump --host=mongo --port=27017 --gzip -o /backup/mongo
# Create archive
TS=$(date +%Y%m%d-%H%M%S)
tar -zcf /backup/mongo-$TS.tar.gz -C /backup mongo
# Remove raw data
rm -rf /backup/mongo
