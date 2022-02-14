import { config } from '@config';
import { isTransportBusArr, Log, MongoDb, RedisClient, TransportBus, TransportCity } from '@core';
import { busesToLocations, getApi, getBusesDiff } from '@lib/api';
import { compact, errToStr, getTs } from '@utils';

const log = Log('lib.updater.buses');

const api = getApi().withCity(TransportCity.Kremenchuk);

const busToDbLogRec = (item: Partial<TransportBus>, ts: number) => {
  if (!item.tid) {
    return undefined;
  }
  const { tid, lat, lng, speed, direction } = item;
  type Record = Partial<Pick<TransportBus, 'tid' | 'lat' | 'lng' | 'speed' | 'direction'>> & { ts: number };
  const data: Record = { tid, ts, lat, lng, speed, direction };
  return data;
};

export const handleBusesUpdate = (db: MongoDb, redis: RedisClient) => async () => {
  const itemsColl = db.collection('transportItems');

  const updateItemsDbRecords = async (items: TransportBus[]) =>
    Promise.all(
      items.map(itm => itemsColl.updateOne({ tid: itm.tid }, { $set: { ...itm, updatedAt: getTs() } }, { upsert: true })),
    );

  const logColl = db.collection('transportLog');

  const processNewBussesData = async (buses: TransportBus[]) => {
    const curKey = 'kremen:transport:data:buses';
    try {
      const prevStr = await redis.get(curKey);
      await redis.set(curKey, JSON.stringify(buses));
      if (!prevStr) {
        log.debug('prev buses not found, adding all current states');
        return await processChangedBusesData(buses);
      }

      const prevBuses = JSON.parse(prevStr);
      if (!isTransportBusArr(prevBuses)) {
        log.warn('prev buses record exist, but with a wrong format');
        return await processChangedBusesData(buses);
      }

      const diff = getBusesDiff(prevBuses, buses);
      if (!diff.length) return log.debug('busses changes not found');

      return await processChangedBusesData(diff);
    } catch (err: unknown) {
      log.err('adding new bus log records err', { msg: errToStr(err) });
    }
  };

  const processChangedBusesData = async (items: Partial<TransportBus>[]) => {
    log.debug('processing buses changes', { count: items.length });
    await redis.publish('kremen:transport:updates:buses', JSON.stringify(items));
    await addLogDbRecrords(items);
  };

  const addLogDbRecrords = async (items: Partial<TransportBus>[]) => {
    const ts = getTs();
    const records = compact(items.map(itm => busToDbLogRec(itm, ts)));
    if (!records.length) return;
    log.debug(`adding new log records`, { coutn: records.length });
    await logColl.insertMany(records);
  };

  try {
    log.debug('buses update started');

    log.debug('getting buses');
    const buses = await api.getRoutesBuses();
    const locations = busesToLocations(buses);
    log.debug('getting buses done');

    log.debug('saving buses to cache');
    await redis.setEx(`${config.cache.key}:http:/transport/buses`, 10, JSON.stringify(buses));
    log.debug('saving buses to cache done');

    log.debug('saving buses to db');
    await updateItemsDbRecords(buses);
    log.debug('saving buses to db done');

    log.debug('saving locations to cache');
    await redis.setEx(`${config.cache.key}:http:/transport/buses/locations`, 10, JSON.stringify(locations));
    log.debug('saving locations to cache done');

    log.debug('adding new buses log records');
    await processNewBussesData(buses);
    log.debug('adding new buses log records done');

    log.debug('buses update finished');
  } catch (err: unknown) {
    log.err('buses update err', { msg: errToStr(err) });
  }
};
