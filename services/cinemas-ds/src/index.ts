import { config } from '@config';
import { initSentry, log } from '@core';
import { DatasourceError, getFilmaxCinema, getGalaxyCinema, KremenCinema } from '@lib';
import * as Sentry from '@sentry/node';
import { errToStr, sendDatasourceErr, sendInternalServerErr, sendNotFoundErr, sendOk } from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

initSentry();
log.info('config', config);

const handleGet = async (res: ServerResponse) => {
  const cinemas: KremenCinema[] = await Promise.all([getGalaxyCinema(), getFilmaxCinema()]);
  return sendOk(res, cinemas);
};

export default async (req: IncomingMessage, res: ServerResponse) => {
  const { method } = req;
  const { pathname = '' } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (method === 'GET' && pathname === '/cinemas') {
      return await handleGet(res);
    }
    if (method === 'GET' && pathname === '/cinemas/filmax') {
      return sendOk(res, await getFilmaxCinema());
    }
    if (method === 'GET' && pathname === '/cinemas/galaxy') {
      return sendOk(res, await getGalaxyCinema());
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
