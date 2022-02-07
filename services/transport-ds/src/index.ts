import { config } from '@config';
import { initSentry, log } from '@core';
import { busesToLocations, DatasourceError, getApi, TransportCity } from '@lib';
import * as Sentry from '@sentry/node';
import {
  errToStr,
  HttpQs,
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

initSentry();
log.info('config', config);

const api = getApi().withCity(TransportCity.Kremenchuk);

const handleRoutes = async (res: ServerResponse) => {
  const data = await api.getRoutesWithStations();
  return sendOk(res, data);
};

const handleBuses = async (res: ServerResponse, query: HttpQs) => {
  const rids = isStr(query.rids) ? parseQueryIdsParam(query.rids) : undefined;
  const data = await api.getRoutesBuses(rids);
  return sendOk(res, data);
};

const handleBusesLocations = async (res: ServerResponse, query: HttpQs) => {
  const rids = isStr(query.rids) ? parseQueryIdsParam(query.rids) : undefined;
  const buses = await api.getRoutesBuses(rids);
  const locations = busesToLocations(buses);
  return sendOk(res, locations);
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
  const rids = isStr(query.rids) ? parseQueryIdsParam(query.rids) : undefined;
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
  const { method } = req;
  const { pathname = '', query = {} } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (method === 'GET' && pathname === '/transport/routes') {
      return await handleRoutes(res);
    }
    if (method === 'GET' && pathname === '/transport/buses/locations') {
      return await handleBusesLocations(res, query);
    }
    if (method === 'GET' && pathname === '/transport/buses') {
      return await handleBuses(res, query);
    }
    if (method === 'GET' && pathname === '/transport/find') {
      return await handleFind(res, query);
    }
    // Buses
    if (method === 'GET' && pathname === '/transport/buses/stations') {
      return await handleBusesStations(res, query);
    }
    // Stations
    const stationPredictionMatch = /^\/transport\/stations\/(\d+)\/prediction$/g.exec(pathname);
    if (method === 'GET' && stationPredictionMatch) {
      return await handleStationPrediction(res, query, { sid: parseInt(stationPredictionMatch[1], 10) });
    }
    // Routes
    const routeBusesMatch = /^\/transport\/routes\/(\d+)\/buses$/g.exec(pathname);
    if (method === 'GET' && routeBusesMatch) {
      return await handleRouteBusses(res, query, { rid: parseInt(routeBusesMatch[1], 10) });
    }
    const routeStationsMatch = /^\/transport\/routes\/(\d+)\/stations$/g.exec(pathname);
    if (method === 'GET' && routeStationsMatch) {
      return await handleRouteStations(res, query, { rid: parseInt(routeStationsMatch[1], 10) });
    }
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
