import { config } from '@config';
import { Log, MongoDb, RedisClient, TransportCity, TransportRoute } from '@core';
import { getApi } from '@lib';
import { errToStr, hourSec } from '@utils';

const log = Log('updater');

const api = getApi().withCity(TransportCity.Kremenchuk);

export const handleRoutesUpdate = (db: MongoDb, redis: RedisClient) => async () => {
  const coll = db.collection('transportRoutes');

  const updateDbRecords = async (items: TransportRoute[]) =>
    Promise.all(items.map(itm => coll.updateOne({ rid: itm.rid }, { $set: itm }, { upsert: true })));

  try {
    log.debug('routes update started');

    log.debug('getting routes');
    const routes = await api.getRoutes();
    log.debug('getting routes done');

    log.debug('saving response to cache');
    await redis.setEx(`${config.cache.key}:http:/transport/routes`, hourSec, JSON.stringify(routes));
    log.debug('saving response to cache done');

    log.debug('updating db records');
    await updateDbRecords(routes);
    log.debug('updating db records done');

    log.debug('routes update finished');
  } catch (err: unknown) {
    log.err('routes update err', { msg: errToStr(err) });
  }
};
