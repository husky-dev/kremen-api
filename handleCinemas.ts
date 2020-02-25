import { Cinema } from '@kremen/core';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { cacheWithRootKey } from 'core/cache';
import { getFilmaxCinema, getGalaxyCinema } from 'services/cinemas';
import { hourSec, isCacheEnabled, Log, notFoundResp, okResp, serverErrResp } from 'utils';

const log = Log('cinemas.handler');

// Cache
const {
  env: { NODE_ENV },
} = process;
const cacheRootKey = `kremen:cinemas:${NODE_ENV}`;
const { getCache, setCache } = cacheWithRootKey(cacheRootKey);

export const handler: APIGatewayProxyHandler = async event => {
  log.trace('event=', event);
  log.start(`resource ${event.resource}`);
  const res = await processEvent(event);
  log.end(`resource ${event.resource}`);
  return res;
};

const processEvent = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { resource, queryStringParameters, pathParameters } = event;
  const cache = isCacheEnabled(queryStringParameters);
  log.debug('cache=', cache);
  try {
    if (resource === '/cinemas') {
      return handleCinemas(cache);
    }
    if (resource === '/cinemas/{cid}') {
      if (!pathParameters || !pathParameters['cid']) {
        return notFoundResp('cid not found');
      }
      return handleCinema(pathParameters['cid'], cache);
    }
    return notFoundResp(`${resource} not found`);
  } catch (err) {
    log.err(err);
    return serverErrResp(err.message);
  }
};

const handleCinemas = async (cache: boolean) => {
  const cachedData = cache ? await getCache<string>('all') : null;
  if (cachedData) {
    return okResp(cachedData);
  }
  const data = await Promise.all([getGalaxyCinema(), getFilmaxCinema()]);
  await setCache('all', data, hourSec);
  return okResp(data);
};

const handleCinema = async (cid: string, cache: boolean) => {
  const cinemaHandler = cidToCinemaHandler(cid);
  if (!cinemaHandler) {
    return notFoundResp(`cinema not found: ${cid}`);
  }
  const cachedData = cache ? await getCache<string>(`cinemas:${cid}`) : null;
  if (cachedData) {
    return okResp(cachedData);
  }
  const data = await cinemaHandler();
  await setCache(`cinemas:${cid}`, data, hourSec);
  return okResp(data);
};

type CinemaHandler = () => Promise<Cinema>;

const cidToCinemaHandler = (cid: string): CinemaHandler | undefined => {
  if (cid === 'galaxy') {
    return getGalaxyCinema;
  }
  if (cid === 'filmax') {
    return getFilmaxCinema;
  }
};
