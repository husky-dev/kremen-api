import { config } from '@config';
import { Log } from './log';
import { Db, MongoClient } from 'mongodb';

const log = Log('core.mongo');

export const initMongo = async (): Promise<{ db: Db; client: MongoClient }> =>
  new Promise((resolve, reject) => {
    const mongoUrl = `mongodb://${config.mongodb.host}:${config.mongodb.port}`;
    log.info(`connecting to mongo`, { url: mongoUrl });
    MongoClient.connect(mongoUrl, (err, client) => {
      if (err) return reject(err);
      if (!client) return reject(new Error('mongo client is empty'));
      log.info(`connecting to mongo done`);
      const db = client.db(config.mongodb.name);
      resolve({ db, client });
    });
  });

export { Db as MongoDb, MongoClient } from 'mongodb';
