import { Log } from '@core/log';
import { isStr } from '@utils';
import axios from 'axios';

import {
  EquipmentLogQueryOpt,
  EquipmentLogRecord,
  EquipmentMachine,
  TransportBus,
  TransportBusesLocations,
  TransportPrediction,
  TransportRoute,
} from './types';
import { ApiError, ApiReqOpt, isApiErrorResp, isStaus200 } from './utils';

const log = Log('core.api');

interface ApiOpt {
  apiRoot: string;
}

export const getApi = ({ apiRoot }: ApiOpt) => {
  const apiReq = async <T>(opt: ApiReqOpt): Promise<T> => {
    const { path, method = 'get', params } = opt;
    const reqUrl = `${apiRoot}${path}`;
    log.debug('api req', { url: reqUrl, params });
    const { status, statusText, data } = await axios({ method, url: reqUrl, params, validateStatus: () => true });
    log.debug(`api req done`);
    if (!isStaus200(status)) {
      if (isApiErrorResp(data)) {
        throw new ApiError(data.code, data.message);
      } else if (isStr(data)) {
        throw new ApiError('UNKNOWN', data);
      } else {
        throw new Error(`${status}: ${statusText}`);
      }
    }
    return data as unknown as T;
  };

  return {
    transport: {
      routes: async (): Promise<TransportRoute[]> => apiReq<TransportRoute[]>({ path: `transport/routes` }),
      buses: async (): Promise<TransportBus[]> => apiReq<TransportBus[]>({ path: `transport/buses` }),
      busesLocations: async () => apiReq<TransportBusesLocations>({ path: `transport/buses/locations` }),
      stationPrediction: async (sid: number): Promise<TransportPrediction[]> =>
        apiReq<TransportPrediction[]>({ path: `transport/stations/${sid}/prediction` }),
    },
    equipment: {
      list: async (): Promise<EquipmentMachine[]> => apiReq<EquipmentMachine[]>({ path: `equipment` }),
      log: async (opt: EquipmentLogQueryOpt) =>
        apiReq<EquipmentLogRecord[]>({ path: 'equipment/log', params: { format: 'array', ...opt } }),
    },
  };
};

export * from './types';
export * from './utils';
