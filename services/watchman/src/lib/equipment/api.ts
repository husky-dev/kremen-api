import { Log } from '@utils';
import axios from 'axios';

import { EquipmentMachine } from './types';

const log = Log('equipment');

const getApi = () => {
  const apiRoot = `http://equipment-api:8080`;

  const getItems = async (): Promise<EquipmentMachine[]> => {
    log.debug('getting items');
    const { status, data } = await axios(`${apiRoot}/equipment`);
    if (status < 200 || status > 299) {
      throw new Error(`Wrong response status: ${status}`);
    }
    log.debug('getting items done');
    return data;
  };

  return { getItems };
};

export const api = getApi();
