import { config } from '@config';
import { Log } from './log';
import { Db, MongoClient } from 'mongodb';

const log = Log('mongo');

export const initMongoClient = async (): Promise<Db> =>
  new Promise((resolve, reject) => {
    const mongoUrl = `mongodb://${config.mongodb.host}:${config.mongodb.port}`;
    log.info(`connecting to mongo`, { url: mongoUrl });
    MongoClient.connect(mongoUrl, (err, client) => {
      if (!client) return reject(new Error('mongo client is empty'));
      if (err) return reject(err);
      log.info(`connecting to mongo done`);
      const db = client.db(config.mongodb.name);
      resolve(db);
    });
  });
