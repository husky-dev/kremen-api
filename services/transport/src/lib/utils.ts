import { compact } from 'lodash';
import { LatLng } from 'utils';
import { defTransportRouteColor, tranpsortRouteColors } from './consts';

import {
  TransportBus,
  TransportDataSourceBus,
  TransportDataSourcePrediction,
  TransportDataSourceStation,
  TransportPrediction,
  TransportRoute,
  TransportDataSourceRoute,
  TransportStation,
  TransportType,
} from './types';

// Data Source

export const parseDataSourceRoute = (input: TransportDataSourceRoute): TransportRoute => {
  const { busreportRouteId, location, bussesOnRoute, routeName, routeNumber } = input;
  const path = parseLatLngPath(location);
  const type = routeNumberToTransportType(routeNumber);
  const color = tranpsortRouteColors[routeNumber] || defTransportRouteColor;
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

const busNameToType = (val: string): TransportType =>
  /^[TТ]/g.test(val) ? TransportType.Trolleybus : TransportType.Bus;

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

export const strToLatLng = (val: string): LatLng | undefined => {
  if (!val) {
    return undefined;
  }
  const parts = val.split(',');
  if (parts.length !== 2) return undefined;
  const lat = parseFloat(parts[0]);
  if (isNaN(lat)) {
    return undefined;
  }
  const lng = parseFloat(parts[1]);
  if (isNaN(lng)) {
    return undefined;
  }
  return { lat, lng };
};
