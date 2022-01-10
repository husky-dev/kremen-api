import { config } from '@config';
import { Log, RedisClientType } from '@core';
import { getApi, TransportBus } from '@core/api';
import { ApiError } from '@core/api/utils';
import { errToStr, hourSec, minMs, secMs } from '@utils';
import { compact } from 'lodash';
import { Db } from 'mongodb';
import WebSocket from 'ws';

import { getBusesDiff } from './utils';

const log = Log('tranposrt');

interface WatcherOpt {
  wss: WebSocket.Server;
  mongo: Db;
  redis: RedisClientType;
}

export const initTransprotWatcher = ({ wss, mongo, redis }: WatcherOpt) => {
  // WSS

  const api = getApi({ apiRoot: 'http://transport-api:8080/' });

  wss.on('connection', () => {
    log.debug('new connection');
  });

  const wssProcessChanged = (data: Partial<TransportBus>[]) => {
    wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'buses', data }));
      }
    });
  };

  // Mongo

  const itemsCollection = mongo.collection('transportItems');

  const mongoProcessItems = async (items: TransportBus[]) =>
    Promise.all(items.map(itm => itemsCollection.updateOne({ eid: itm.tid }, { $set: itm }, { upsert: true })));

  const logCollection = mongo.collection('transportLog');

  const mongoProcessChanged = (items: Partial<TransportBus>[]) => {
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

  const itemDataToMongoLogRec = (item: Partial<TransportBus>, ts: number) => {
    if (!item.tid) {
      return undefined;
    }
    const { tid, lat, lng, speed, direction } = item;
    type Record = Partial<Pick<TransportBus, 'tid' | 'lat' | 'lng' | 'speed' | 'direction'>> & { ts: number };
    const data: Record = { tid, ts, lat, lng, speed, direction };
    return data;
  };

  // Processing

  let prevBuses: TransportBus[] = [];

  const processBusesUpdate = async () => {
    try {
      log.debug('processing buses');

      const newBuses = await api.transport.buses();

      log.debug('saving buses to db');
      await mongoProcessItems(newBuses);
      log.debug('saving buses to db done');

      log.debug('saving buses to cache');
      await redis.setEx(`${config.cache.nginxKey}:/transport/buses`, 10, JSON.stringify(newBuses));
      log.debug('saving buses to cache done');

      const newLocations = await api.transport.busesLocations();
      log.debug('saving locations to cache');
      await redis.setEx(`${config.cache.nginxKey}:/transport/buses/locations`, 10, JSON.stringify(newLocations));
      log.debug('saving locations to cache done');

      const diff = getBusesDiff(prevBuses, newBuses);
      if (diff.length) {
        log.debug(`buses changed, count=`, diff.length);
        wssProcessChanged(diff);
        mongoProcessChanged(diff);
      }
      prevBuses = newBuses;

      log.debug('processing buses done');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'DATASOURCE_ERROR') {
        return log.debug('datasource unavailable, skip');
      }
      log.err('processing buses', { err: errToStr(err) });
    }
  };

  const processRoutesUpdate = async () => {
    try {
      log.debug('processing routes');

      const routes = await api.transport.routes();

      log.debug('saving response to cache');
      await redis.setEx(`${config.cache.nginxKey}:/transport/routes`, hourSec, JSON.stringify(routes));
      log.debug('saving response to cache done');

      log.debug('processing routes done');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'DATASOURCE_ERROR') {
        return log.debug('datasource unavailable, skip');
      }
      log.err('processing routes', { err: errToStr(err) });
    }
  };

  processBusesUpdate();

  setInterval(() => {
    processBusesUpdate();
  }, secMs * 5);

  processRoutesUpdate();

  setInterval(() => {
    processRoutesUpdate();
  }, minMs);
};
