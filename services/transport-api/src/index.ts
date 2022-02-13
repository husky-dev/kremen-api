import { config } from '@config';
import { initMongo, initRedis, initSentry, log } from '@core';
import { reqHandler } from '@lib';
import { errToStr } from '@utils';
import micro from 'micro';

initSentry();
log.info('config', config);

const start = async () => {
  try {
    const { db, client: mongo } = await initMongo();
    const redis = await initRedis();
    const server = micro(reqHandler(db, redis));
    log.info('start server', { port: config.port });
    server.listen(config.port);

    process.on('SIGTERM', async () => {
      try {
        log.info('SIGTERM signal received');
        server.close();
        mongo.close();
        redis.disconnect();
      } catch (err: unknown) {
        log.err('SIGTERM signal processing err', { msg: errToStr(err) });
      }
    });
  } catch (err: unknown) {
    log.err('start server err', { msg: errToStr(err) });
  }
};

start();
