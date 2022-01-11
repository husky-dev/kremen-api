import { config } from '@config';
import { initSentry, log } from '@core';
import { DatasourceError, getFilmaxCinema } from '@lib';
import * as Sentry from '@sentry/node';
import { errToStr, sendDatasourceErr, sendInternalServerErr, sendNotFoundErr, sendOk } from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

initSentry();
log.info('config', config);

const handleGet = async (res: ServerResponse) => {
  const data = await getFilmaxCinema();
  return sendOk(res, [data]);
};

export default async (req: IncomingMessage, res: ServerResponse) => {
  const { method } = req;
  const { pathname = '' } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (method === 'GET' && pathname === '/cinemas') {
      return await handleGet(res);
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
