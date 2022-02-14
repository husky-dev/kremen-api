import { config } from '@config';
import { initMongo, initRedis, initSentry, log, Timer } from '@core';
import { errToStr, hourMs, secMs } from '@utils';
import micro from 'micro';

import { reqHandler } from './router';
import { handleBusesUpdate, handleRoutesUpdate } from '@lib/updater';

initSentry();
log.info('config', config);

const start = async () => {
  try {
    const { db, client: mongo } = await initMongo();
    const redis = await initRedis();

    const server = micro(reqHandler(db, redis));
    log.info('start server', { port: config.port });
    server.listen(config.port);

    const routesUpdater = new Timer(hourMs, handleRoutesUpdate(db, redis));
    routesUpdater.start();

    const busesUpdater = new Timer(secMs * 5, handleBusesUpdate(db, redis));
    busesUpdater.start();

    process.on('SIGTERM', async () => {
      try {
        log.info('SIGTERM signal received');
        routesUpdater.stop();
        busesUpdater.stop();
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
