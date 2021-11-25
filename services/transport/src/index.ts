import { config } from '@config';
import { Log } from '@core';
import { getApi, TransportCity } from '@lib';
import {
  errToStr,
  HttpQs,
  isStr,
  parseIdsStr,
  sendInternalServerErr,
  sendNotFoundErr,
  sendOk,
  sendParamMissedErr,
  sendWrongFormatErr,
  strToLatLng,
} from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

const log = Log('tranposrt');
log.info('config', config);

const api = getApi().withCity(TransportCity.Kremenchuk);

const handleRoutes = async (res: ServerResponse) => {
  const data = await api.getRoutesWithStations();
  return sendOk(res, data);
};

const handleBuses = async (res: ServerResponse, query: HttpQs) => {
  const rids = isStr(query.rids) ? parseIdsStr(query.rids) : undefined;
  const data = await api.getRoutesBuses(rids);
  return sendOk(res, data);
};

const handleFind = async (res: ServerResponse, query: HttpQs) => {
  const { from: fromStr, to: toStr } = query;
  if (!fromStr || !isStr(fromStr)) {
    return sendParamMissedErr(res, 'from');
  }
  const from = strToLatLng(fromStr);
  if (!from) {
    return sendWrongFormatErr(res, 'from');
  }
  if (!toStr || !isStr(toStr)) {
    return sendParamMissedErr(res, 'to');
  }
  const to = strToLatLng(toStr);
  if (!to) {
    return sendWrongFormatErr(res, 'to');
  }
  const data = await api.findRoute(from, to);
  return sendOk(res, data);
};

export default async (req: IncomingMessage, res: ServerResponse) => {
  const { pathname = '', query = {} } = req.url ? url.parse(req.url, true) : {};
  try {
    if (req.method === 'GET' && pathname === '/routes') return handleRoutes(res);
    if (req.method === 'GET' && pathname === '/buses') return handleBuses(res, query);
    if (req.method === 'GET' && pathname === '/find') return handleFind(res, query);
    return sendNotFoundErr(res, 'Endpoint not found');
  } catch (err: unknown) {
    return sendInternalServerErr(res, errToStr(err));
  }
};
