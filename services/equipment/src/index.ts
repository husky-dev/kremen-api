import { config } from '@config';
import { log } from '@core';
import { api } from '@lib';
import * as Sentry from '@sentry/node';
import { errToStr, sendInternalServerErr, sendNotFoundErr, sendOk } from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

log.info('config', config);

Sentry.init({
  dsn: config.sentry.dsn,
  tracesSampleRate: 1.0,
  environment: config.env,
  debug: config.env === 'development' ? true : false,
  release: `${config.name.replace('@kremen/', 'kremen-')}@${config.version}`,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

const handleList = async (res: ServerResponse) => {
  const data = await api.getEquipmentList();
  return sendOk(res, data);
};

export default async (req: IncomingMessage, res: ServerResponse) => {
  const { pathname = '' } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (req.method === 'GET' && pathname === '/equipment') return handleList(res);
    // Default respond
    return sendNotFoundErr(res, 'Endpoint not found');
  } catch (err: unknown) {
    Sentry.captureException(err);
    return sendInternalServerErr(res, errToStr(err));
  }
};
