import { config } from '@config';
import { EquipmentMachine, isEquipmentMachineArr, Log, MongoDb, RedisClient } from '@core';
import { compact, errToStr, getTs } from '@utils';
import { api, DatasourceError, getEquipmentMachineDiff } from './api';

const log = Log('lib.updater');

export const handleItemsUpdate = (db: MongoDb, redis: RedisClient) => async () => {
  const itemsColl = db.collection('equipmentItems');

  const updateItemsDbRecords = async (items: EquipmentMachine[]) => {
    return Promise.all(items.map(itm => itemsColl.updateOne({ eid: itm.eid }, { $set: itm }, { upsert: true })));
  };

  const logColl = db.collection('equipmentLog');

  const processNewItemsData = async (items: EquipmentMachine[]) => {
    const curKey = 'kremen:equipment:data:items';
    try {
      const prevStr = await redis.get(curKey);
      await redis.set(curKey, JSON.stringify(items));
      if (!prevStr) {
        log.debug('prev buses not found, adding all current states');
        return await processChangedItemsData(items);
      }

      const prevItems = JSON.parse(prevStr);
      if (!isEquipmentMachineArr(prevItems)) {
        log.warn('prev buses record exist, but with a wrong format');
        return await processChangedItemsData(items);
      }

      const diff = getEquipmentMachineDiff(prevItems, items);
      if (!diff.length) return log.debug('items changes not found');

      return await processChangedItemsData(diff);
    } catch (err: unknown) {
      log.err('adding new items log records err', { msg: errToStr(err) });
    }
  };

  const processChangedItemsData = async (items: Partial<EquipmentMachine>[]) => {
    log.debug('processing buses changes', { count: items.length });
    await redis.publish('kremen:equipment:updates:items', JSON.stringify(items));
    await addLogDbRecrords(items);
  };

  const addLogDbRecrords = async (items: Partial<EquipmentMachine>[]) => {
    const ts = getTs();
    const records = compact(items.map(itm => itemToDbLogRec(itm, ts)));
    if (!records.length) return;
    log.debug(`adding new log records`, { coutn: records.length });
    await logColl.insertMany(records);
  };

  const itemToDbLogRec = (item: Partial<EquipmentMachine>, ts: number) => {
    if (!item.eid || !item.lat || !item.lng) {
      return undefined;
    }
    const { eid, lat, lng, speed } = item;
    type Record = Partial<Pick<EquipmentMachine, 'eid' | 'lat' | 'lng' | 'speed'>> & { ts: number };
    const data: Record = { eid, lat, lng, ts };
    if (speed) data.speed = speed;
    return data;
  };

  try {
    log.debug('processing items');

    const newItems = await api.getEquipmentList();

    log.debug('saving response to cache');
    await redis.setEx(`${config.cache.key}:http:/equipment`, 10, JSON.stringify(newItems));
    log.debug('saving response to cache done');

    log.debug('updating data in db');
    await updateItemsDbRecords(newItems);
    log.debug('updating data in db done');

    log.debug('adding new buses log records');
    await processNewItemsData(newItems);
    log.debug('adding new buses log records done');

    log.debug('processing items done');
  } catch (err: unknown) {
    if (err instanceof DatasourceError) {
      return log.warn('datasource unavailable, skip');
    }
    log.err('processing items err', { err: errToStr(err) });
  }
};
