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

const handleBusesStations = async (res: ServerResponse, query: HttpQs) => {
  const rids = isStr(query.rids) ? parseIdsStr(query.rids) : undefined;
  const data = await api.getRoutesStations(rids);
  return sendOk(res, data);
};

const handleStationPrediction = async (res: ServerResponse, query: HttpQs, { sid }: { sid: number }) => {
  const data = await api.getStationPrediction(sid);
  return sendOk(res, data);
};

const handleRouteBusses = async (res: ServerResponse, query: HttpQs, { rid }: { rid: number }) => {
  const data = await api.getRouteBuses(rid);
  return sendOk(res, data);
};

const handleRouteStations = async (res: ServerResponse, query: HttpQs, { rid }: { rid: number }) => {
  const data = await api.getRouteStations(rid);
  return sendOk(res, data);
};

export default async (req: IncomingMessage, res: ServerResponse) => {
  const { pathname = '', query = {} } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (req.method === 'GET' && pathname === '/routes') return handleRoutes(res);
    if (req.method === 'GET' && pathname === '/buses') return handleBuses(res, query);
    if (req.method === 'GET' && pathname === '/find') return handleFind(res, query);
    // Buses
    if (req.method === 'GET' && pathname === '/buses/stations') return handleBusesStations(res, query);
    // Stations
    const stationPredictionMatch = /^\/stations\/(\d+)\/prediction$/g.exec(pathname);
    if (req.method === 'GET' && stationPredictionMatch) {
      return handleStationPrediction(res, query, { sid: parseInt(stationPredictionMatch[1], 10) });
    }
    // Routes
    const routeBusesMatch = /^\/routes\/(\d+)\/buses$/g.exec(pathname);
    if (req.method === 'GET' && routeBusesMatch) {
      return handleRouteBusses(res, query, { rid: parseInt(routeBusesMatch[1], 10) });
    }
    const routeStationsMatch = /^\/routes\/(\d+)\/stations$/g.exec(pathname);
    if (req.method === 'GET' && routeStationsMatch) {
      return handleRouteStations(res, query, { rid: parseInt(routeStationsMatch[1], 10) });
    }
    // Default respond
    return sendNotFoundErr(res, 'Endpoint not found');
  } catch (err: unknown) {
    return sendInternalServerErr(res, errToStr(err));
  }
};
