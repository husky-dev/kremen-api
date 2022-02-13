import { httpCache, MongoDb, RedisClient, TransportCity } from '@core';
import * as Sentry from '@sentry/node';
import {
  createHttpRouter,
  daySec,
  errToStr,
  HttpRouteHandler,
  isStr,
  parseQueryIdsParam,
  sendDatasourceErr,
  sendInternalServerErr,
  sendNotFoundErr,
  sendOk,
  sendParamMissedErr,
  sendWrongFormatErr,
  strToLatLng,
} from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

import { busesToLocations, DatasourceError, getApi } from './ds';

const api = getApi().withCity(TransportCity.Kremenchuk);

const handleRoutes: HttpRouteHandler = async (req, res) => {
  const data = await api.getRoutesWithStations();
  return sendOk(res, data, { cache: { type: 'public', sec: daySec } });
};

const handleBuses: HttpRouteHandler = async (req, res, { query }) => {
  const rids = isStr(query.rids) ? parseQueryIdsParam(query.rids) : undefined;
  const data = await api.getRoutesBuses(rids);
  return sendOk(res, data);
};

const handleBusesLocations: HttpRouteHandler = async (req, res, { query }) => {
  const rids = isStr(query.rids) ? parseQueryIdsParam(query.rids) : undefined;
  const buses = await api.getRoutesBuses(rids);
  const locations = busesToLocations(buses);
  return sendOk(res, locations);
};

const handleFind: HttpRouteHandler = async (req, res, { query }) => {
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

const handleBusesStations: HttpRouteHandler = async (req, res, { query }) => {
  const rids = isStr(query.rids) ? parseQueryIdsParam(query.rids) : undefined;
  const data = await api.getRoutesStations(rids);
  return sendOk(res, data);
};

const handleStationPrediction: HttpRouteHandler = async (req, res, { params = [] }) => {
  const sid = parseInt(params[0]);
  const data = await api.getStationPrediction(sid);
  return sendOk(res, data);
};

const handleRouteBusses: HttpRouteHandler = async (req, res, { params = [] }) => {
  const rid = parseInt(params[0]);
  const data = await api.getRouteBuses(rid);
  return sendOk(res, data);
};

const handleRouteStations: HttpRouteHandler = async (req, res, { params = [] }) => {
  const rid = parseInt(params[0]);
  const data = await api.getRouteStations(rid);
  return sendOk(res, data, { cache: { type: 'public', sec: daySec } });
};

export const reqHandler = (db: MongoDb, redis: RedisClient) => async (req: IncomingMessage, res: ServerResponse) => {
  const { getCacheForReq } = httpCache(redis);
  const { pathname = '' } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  // Cache
  const cached = await getCacheForReq(req);
  if (cached) return sendOk(res, cached);
  // Rotues
  const router = createHttpRouter([
    // Routes
    { path: '/transport/routes', handler: handleRoutes },
    { path: /^\/transport\/routes\/(\d+)\/buses$/g, handler: handleRouteBusses },
    { path: /^\/transport\/routes\/(\d+)\/stations$/g, handler: handleRouteStations },
    // Stations
    { path: /^\/transport\/stations\/(\d+)\/prediction$/g, handler: handleStationPrediction },
    // Buses
    { path: '/transport/buses', handler: handleBuses },
    { path: '/transport/buses/locations', handler: handleBusesLocations },
    { path: '/transport/buses/stations', handler: handleBusesStations },
    // Find route
    { path: '/transport/find', handler: handleFind },
  ]);
  try {
    return await router.processReq(req, res);
  } catch (err: unknown) {
    if (err instanceof DatasourceError) {
      return sendDatasourceErr(res, err.message);
    }
    Sentry.captureException(err);
    return sendInternalServerErr(res, errToStr(err));
  }
};
