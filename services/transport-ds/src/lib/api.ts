import { Log } from '@core';
import { parseDataSourceRoutes } from '@lib';
import { errToStr, HttpQs, LatLng, wait } from '@utils';
import axios from 'axios';
import { flatten } from 'lodash';

import {
  TransportBus,
  TransportCity,
  TransportCountry,
  TransportDataSourceBus,
  TransportDataSourcePrediction,
  TransportDataSourceRoute,
  TransportDataSourceStation,
  TransportRoute,
  TransportStation,
} from './types';
import { parseDataSourceBus, parseDataSourcePrediction, parseDataSourceStation } from './utils';

const log = Log('lib');

export class DatasourceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

interface ApiReqOpt {
  path: string;
  qs?: HttpQs;
  retry?: number;
}

const maxRetryCount = 3;

export const getApi = () => {
  const apiReq = async <T>({ path, qs, retry = 0 }: ApiReqOpt): Promise<T> => {
    try {
      const defQs = { lang: 'ru' };
      const reqQs = qs ? { ...defQs, ...qs } : defQs;
      const url = `https://infobus.kz${path}`;
      log.debug('api req', { url, qs });
      const { data } = await axios({ url, params: reqQs });
      return data;
    } catch (err: unknown) {
      if (retry >= maxRetryCount) throw new DatasourceError(`${errToStr(err)}`);
      const waitMs = 2 ** retry * 100;
      log.debug('api req err, retry', { path, qs, waitMs });
      await wait(waitMs);
      return apiReq({ path, qs, retry: retry + 1 });
    }
  };

  // Country

  const getCountries = async () => apiReq({ path: '/countries' });

  // City

  const getCitites = async (countryId: TransportCountry) => apiReq({ path: `/countries/${countryId}/cities` });

  const withCity = (cityId: TransportCity) => {
    const getCity = async () => apiReq({ path: `/cities/${cityId}` });

    // Routes

    const getRoutes = async (): Promise<TransportRoute[]> =>
      parseDataSourceRoutes(await apiReq<TransportDataSourceRoute[]>({ path: `/cities/${cityId}/routes` }));

    const getRoutesWithStations = async (): Promise<TransportRoute[]> => {
      const routes = await getRoutes();
      const rids = routes.map(itm => itm.rid);
      const stations = await getRoutesStations(rids);
      const data = routes.map(route => {
        const routeStations = stations.filter(({ rid }) => rid === route.rid);
        return { ...route, stations: routeStations };
      });
      return data;
    };

    const getRoutesCount = async () => apiReq({ path: `/cities/${cityId}/routeamount` });

    const findRoute = async (from: LatLng, to: LatLng) => {
      const qs: HttpQs = {
        sourceLat: `${from.lat}`,
        sourceLng: `${from.lng}`,
        targetLat: `${to.lat}`,
        targetLng: `${to.lng}`,
      };
      return apiReq({ path: `/cities/${cityId}/pathsbwpoints`, qs });
    };

    // Stations

    const getRouteStations = async (rid: number): Promise<TransportStation[]> =>
      (await apiReq<TransportDataSourceStation[]>({ path: `/cities/${cityId}/routes/${rid}/stations` })).map(
        parseDataSourceStation,
      );

    const getRoutesStations = async (rids?: number[]): Promise<TransportStation[]> => {
      const curRids: number[] = rids ? rids : (await getRoutes()).map(({ rid }) => rid);
      return flatten(await Promise.all(curRids.map(getRouteStations)));
    };

    const getStationPrediction = async (sid: number) =>
      (await apiReq<TransportDataSourcePrediction[]>({ path: `/cities/${cityId}/stations/${sid}/prediction` })).map(
        parseDataSourcePrediction,
      );

    // Busses

    const getBusesCount = async () => apiReq({ path: `/cities/${cityId}/busamount` });

    const getRouteBuses = async (rid: number) =>
      (await apiReq<TransportDataSourceBus[]>({ path: `/cities/${cityId}/routes/${rid}/busses` })).map(parseDataSourceBus);

    const getRoutesBuses = async (rids?: number[]) => {
      const curRids: number[] = rids ? rids : (await getRoutes()).map(({ rid }) => rid);
      const arr = await Promise.all(curRids.map(rid => getRouteBuses(rid)));
      const buses: TransportBus[] = [];
      arr.forEach(routeBuses => buses.push(...routeBuses));
      return buses;
    };

    return {
      getCity,
      getRoutes,
      getRoutesWithStations,
      getRoutesCount,
      getRouteStations,
      findRoute,
      getBusesCount,
      getRouteBuses,
      getRoutesBuses,
      getRoutesStations,
      getStationPrediction,
    };
  };

  return { getCountries, getCitites, withCity };
};

export * from './types';
export * from './utils';
