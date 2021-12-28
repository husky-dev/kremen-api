import { config } from '@config';
import { initMongoClient, log } from '@core';
import { api } from '@lib';
import * as Sentry from '@sentry/node';
import {
  errToStr,
  HttpQs,
  isStr,
  sendErr,
  sendInternalServerErr,
  sendNotFoundErr,
  sendOk,
  sendParamMissedErr,
  sendWrongFormatErr,
} from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import micro from 'micro';
import url from 'url';
import { Db } from 'mongodb';

log.info('config', config);

Sentry.init({
  dsn: config.sentry.dsn,
  tracesSampleRate: 1.0,
  environment: config.env,
  release: `${config.name}@${config.version}`,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

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

const handler = (db: Db) => async (req: IncomingMessage, res: ServerResponse) => {
  const { pathname = '', query = {} } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (req.method === 'GET' && pathname === '/equipment') return handleList(res);
    if (req.method === 'GET' && pathname === '/equipment/log') return handleLog(db)(res, query);
    // Default respond
    return sendNotFoundErr(res, 'Endpoint not found');
  } catch (err: unknown) {
    Sentry.captureException(err);
    return sendInternalServerErr(res, errToStr(err));
  }
};

initMongoClient()
  .then(db => {
    const server = micro(handler(db));
    log.info('starting server', { port: config.port });
    server.listen(config.port);
  })
  .catch(err => {
    log.err('init mongo db err', { err: errToStr(err) });
  });
