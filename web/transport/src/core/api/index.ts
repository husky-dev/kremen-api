import { TransportBus, TransportPrediction, TransportRoute } from '@kremen/types';
import axios from 'axios';
import { genRandId, Log } from 'utils';

import { ApiReqOpt, getErrFromResp } from './utils';

const log = Log('core.api');

export const getApiRoot = () => {
  switch (APP_ENV) {
    case 'loc':
      return {
        api: 'http://localhost:8080',
        ws: 'ws://localhost:8080',
      };
    default:
      return {
        api: 'https://api.kremen.dev',
        ws: 'wss://api.kremen.dev',
      };
  }
};

const getApi = () => {
  const apiRoot = getApiRoot().api;

  const apiReq = async <T>(opt: ApiReqOpt): Promise<T> => {
    const { path, method = 'get', params } = opt;
    const reqUrl = `${apiRoot}/${path}`;
    const id = genRandId(5);
    const msg = `req id=${id}, method=${method}, path=${path}, params=${JSON.stringify(params)}`;
    log.debug(msg);
    log.start(msg);
    const resp = await axios({ method, url: reqUrl, params });
    log.end(msg);
    log.debug(`${msg} done`);
    const { status } = resp;
    const data = (resp.data as unknown) as T;
    const err = getErrFromResp(status, data);
    if (err) {
      throw err;
    }
    return data;
  };

  return {
    transport: {
      routes: async (): Promise<TransportRoute[]> => apiReq<TransportRoute[]>({ path: `transport/routes` }),
      buses: async (): Promise<TransportBus[]> => apiReq<TransportBus[]>({ path: `transport/buses` }),
      stationPrediction: async (sid: number): Promise<TransportPrediction[]> =>
        apiReq<TransportPrediction[]>({ path: `transport/stations/${sid}/prediction` }),
    },
  };
};

export const api = getApi();

export * from '@kremen/types';
