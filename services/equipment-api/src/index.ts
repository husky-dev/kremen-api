import { config } from '@config';
import { initMongo, initRedis, initSentry, log } from '@core';
import { api, DatasourceError, handleItemsUpdate } from '@lib';
import * as Sentry from '@sentry/node';
import {
  errToStr,
  HttpQs,
  isStr,
  secMs,
  sendDatasourceErr,
  sendErr,
  sendInternalServerErr,
  sendNotFoundErr,
  sendOk,
  sendParamMissedErr,
  sendWrongFormatErr,
  Timer,
} from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import micro from 'micro';
import { Db } from 'mongodb';
import url from 'url';

initSentry();
log.info('config', config);

const handleList = async (res: ServerResponse) => {
  const data = await api.getEquipmentList();
  return sendOk(res, data);
};

const handleLog = (db: Db) => async (res: ServerResponse, httpQuery: HttpQs) => {
  const { start: rawStart, end: rawEnd, format, eid: rawEid } = httpQuery;
  if (!rawStart || !isStr(rawStart)) return sendParamMissedErr(res, 'start');
  const startTs = parseInt(rawStart, 10);
  if (isNaN(startTs)) return sendWrongFormatErr(res, 'start');

  if (!rawEnd || !isStr(rawEnd)) return sendParamMissedErr(res, 'end');
  const endTs = parseInt(rawEnd, 10);
  if (isNaN(endTs)) return sendWrongFormatErr(res, 'end');

  if (endTs < startTs) return sendErr(res, 422, `"start" could not be less than "end"`);
  const queryParts: any[] = [{ ts: { $gte: startTs } }, { ts: { $lte: endTs } }];
  if (isStr(rawEid)) {
    const eids = rawEid.split(',');
    queryParts.push({ eid: { $in: eids } });
  }

  const query = { $and: queryParts };
  const cursor = await db.collection('equipmentLog').find(query, { sort: { ts: 1 }, projection: { _id: 0 } });
  if ((await cursor.count()) === 0) return sendOk(res, []);
  const items = await cursor.toArray();
  const data = format === 'array' ? items.map(itm => [itm.eid, itm.lat, itm.lng, itm.ts]) : items;
  return sendOk(res, data);
};

const reqHandler = (db: Db) => async (req: IncomingMessage, res: ServerResponse) => {
  const { pathname = '', query = {} } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (req.method === 'GET' && pathname === '/equipment') return await handleList(res);
    if (req.method === 'GET' && pathname === '/equipment/log') return await handleLog(db)(res, query);
    // Default respond
    return sendNotFoundErr(res, 'Endpoint not found');
  } catch (err: unknown) {
    if (err instanceof DatasourceError) {
      return sendDatasourceErr(res, err.message);
    }
    Sentry.captureException(err);
    return sendInternalServerErr(res, errToStr(err));
  }
};

const start = async () => {
  try {
    const { db, client: mongo } = await initMongo();
    const redis = await initRedis();

    const server = micro(reqHandler(db));
    log.info('start server', { port: config.port });
    server.listen(config.port);

    const itemsUpdater = new Timer(secMs * 5, handleItemsUpdate(db, redis));
    itemsUpdater.start();

    process.on('SIGTERM', async () => {
      try {
        log.info('SIGTERM signal received');
        itemsUpdater.stop();
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
