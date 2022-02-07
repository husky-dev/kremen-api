import { config } from '@config';
import { log } from '@core';
import { errToStr, sendInternalServerErr, sendNotFoundErr, sendOk } from '@utils';
import { ServerResponse, IncomingMessage } from 'http';
import url from 'url';

log.info('config', config);

export default async (req: IncomingMessage, res: ServerResponse) => {
  const { method } = req;

  const { pathname = '' } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (method === 'GET' && pathname === '/ping') {
      return await sendOk(res, { version: config.version });
    }
    return sendNotFoundErr(res, 'Endpoint not found');
  } catch (err: unknown) {
    return sendInternalServerErr(res, errToStr(err));
  }
};
