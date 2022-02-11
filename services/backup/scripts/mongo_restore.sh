#!/usr/bin/env sh
set -ex

tar -xvf mongo-20220210-130725.tar.gz -C /backup/
mongorestore --host=mongo --port=27017 /backup/mongo
