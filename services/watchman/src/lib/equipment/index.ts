import { config } from '@config';
import { Log, RedisClientType } from '@core';
import { errToStr } from '@utils';
import { compact } from 'lodash';
import { Db } from 'mongodb';
import WebSocket from 'ws';

import { api } from './api';
import { EquipmentMachine } from './types';
import { getEquipmentMachineDiff } from './utils';

const log = Log('equipment');

interface WatcherOpt {
  wss: WebSocket.Server;
  mongo: Db;
  redis: RedisClientType;
}

export const initEquipmentWatcher = ({ wss, mongo, redis }: WatcherOpt) => {
  // WSS

  wss.on('connection', () => {
    log.debug('new connection');
  });

  const wssProcessChanged = (data: Partial<EquipmentMachine>[]) => {
    wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'items', data }));
      }
    });
  };

  // Mongo

  const logCollection = mongo.collection('equipmentLog');

  const mongoProcessChanged = (items: Partial<EquipmentMachine>[]) => {
    const ts = new Date().getTime();
    const records = compact(items.map(itm => itemDataToMongoLogRec(itm, ts)));
    if (!records.length) {
      return;
    }
    log.debug(`adding new log records, count=`, records.length);
    logCollection.insertMany(records, err => {
      if (err) {
        log.err(`adding new log records err, msg=`, err.message);
      }
    });
  };

  const itemDataToMongoLogRec = (item: Partial<EquipmentMachine>, ts: number) => {
    if (!item.eid) {
      return undefined;
    }
    const { eid, lat, lng, speed } = item;
    type Record = Partial<Pick<EquipmentMachine, 'eid' | 'lat' | 'lng' | 'speed'>> & { ts: number };
    const data: Record = { eid, ts };
    if (lat) {
      data.lat = lat;
    }
    if (lng) {
      data.lng = lng;
    }
    if (speed) {
      data.speed = speed;
    }
    return data;
  };

  // Processing

  setInterval(() => {
    processItemsUpdate();
  }, 5000);

  let prevItems: EquipmentMachine[] = [];

  const processItemsUpdate = async () => {
    try {
      log.debug('processing items');

      const newItems = await api.getItems();

      log.debug('saving response to cache');
      await redis.setEx(`${config.cache.nginxKey}:/equipment`, 10, JSON.stringify(newItems));
      log.debug('saving response to cache done');

      const diff = getEquipmentMachineDiff(prevItems, newItems);
      if (diff.length) {
        log.debug(`items changed, count=`, diff.length);
        wssProcessChanged(diff);
        mongoProcessChanged(diff);
      }
      prevItems = newItems;

      log.debug('processing items done');
    } catch (err) {
      log.err('processing items err', { err: errToStr(err) });
    }
  };
};