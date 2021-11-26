import { compact } from 'lodash';

import { routeNumberToColor } from './consts';
import {
  TransportBus,
  TransportDataSourceBus,
  TransportDataSourcePrediction,
  TransportDataSourceRoute,
  TransportDataSourceStation,
  TransportPrediction,
  TransportRoute,
  TransportStation,
  TransportType,
} from './types';

// Data Source

export const parseDataSourceRoutes = (input: TransportDataSourceRoute[]): TransportRoute[] => {
  const items = input.map(parseDataSourceRoute);
  return items;
};

export const parseDataSourceRoute = (input: TransportDataSourceRoute): TransportRoute => {
  const { busreportRouteId, location, bussesOnRoute, routeName, routeNumber } = input;
  const path = parseLatLngPath(location);
  const type = routeNumberToTransportType(routeNumber);
  const color = routeNumberToColor(routeNumber);
  return {
    rid: busreportRouteId,
    type,
    path,
    active: bussesOnRoute,
    name: routeName,
    number: routeNumber,
    stations: [],
    color,
  };
};

export const parseDataSourceBus = (input: TransportDataSourceBus): TransportBus => {
  const { busreportRouteId, imei, lon, lat, ...data } = input;
  const type = busNameToType(input.name.trim());
  return { tid: imei, rid: busreportRouteId, type, lat, lng: lon, ...data };
};

export const parseDataSourceStation = (input: TransportDataSourceStation): TransportStation => {
  const { id, routeId, lat, lon, ...data } = input;
  return { sid: id, rid: routeId, lat, lng: lon, ...data };
};

export const parseDataSourcePrediction = (input: TransportDataSourcePrediction): TransportPrediction => {
  const { routeId: rid, stationId: sid, busIMEI: tid, ...data } = input;
  return { rid, sid, tid, ...data };
};

// Parsers

const routeNumberToTransportType = (val: string): TransportType =>
  /^[TТ]/g.test(val) ? TransportType.Trolleybus : TransportType.Bus;

const busNameToType = (val: string): TransportType => (/^[TТ]/g.test(val) ? TransportType.Trolleybus : TransportType.Bus);

const parseLatLngPath = (val: string): number[][] => {
  if (!val) {
    return [];
  }
  const pairs = val.split(', ');
  if (!pairs.length) {
    return [];
  }
  return compact(
    pairs.map(pairStr => {
      const locParts = pairStr.split(' ');
      if (locParts.length !== 2) {
        return undefined;
      }
      const [lngStr, latStr] = locParts;
      return [parseFloat(latStr), parseFloat(lngStr)];
    }),
  );
};
