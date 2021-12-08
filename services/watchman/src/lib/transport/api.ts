import { Log } from '@core';
import axios from 'axios';

const log = Log('tranposrt');

const getApi = () => {
  const apiRoot = `http://transport-api:8080`;
  const getBuses = async () => {
    log.debug('getting buses info');
    const { status, data } = await axios(`${apiRoot}/transport/buses`);
    if (status < 200 || status > 299) {
      throw new Error(`Wrong response status: ${status}`);
    }
    log.debug('getting buses info done');
    return data;
  };

  const getRoutes = async () => {
    log.debug('get routes');
    const { status, data } = await axios(`${apiRoot}/transport/routes`);
    if (status < 200 || status > 299) {
      throw new Error(`Wrong response status: ${status}`);
    }
    log.debug('get routes done');
    return data;
  };

  return { getBuses, getRoutes };
};

export const api = getApi();
