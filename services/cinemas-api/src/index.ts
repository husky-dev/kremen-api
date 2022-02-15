import { config } from '@config';
import { Cinema, initSentry, log } from '@core';
import { cinemasBot, getFilmaxCinema, getGalaxyCinema } from '@lib';
import { errToStr, sendInternalServerErr, sendNotFoundErr, sendOk } from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import micro, { json } from 'micro';
import url from 'url';

initSentry();
log.info('config', config);

const handleGet = async (res: ServerResponse) => {
  const cinemas: Cinema[] = await Promise.all([getGalaxyCinema(), getFilmaxCinema()]);
  return sendOk(res, cinemas);
};

const handler = async (req: IncomingMessage, res: ServerResponse) => {
  const { method } = req;

  const { pathname = '' } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (method === 'GET' && pathname === '/cinemas/ping') {
      return await sendOk(res, { version: config.version });
    }
    if (method === 'GET' && pathname === '/cinemas') {
      return await handleGet(res);
    }
    if (method === 'GET' && pathname === '/cinemas/filmax') {
      return sendOk(res, await getFilmaxCinema());
    }
    if (method === 'GET' && pathname === '/cinemas/galaxy') {
      return sendOk(res, await getGalaxyCinema());
    }
    if (method === 'POST' && pathname === `/cinemas/bot/${config.bot.webhook}`) {
      const data = await json(req);
      await sendOk(res);
      return await cinemasBot.processWebhookReq(data);
    }
    return sendNotFoundErr(res, 'Endpoint not found');
  } catch (err: unknown) {
    return sendInternalServerErr(res, errToStr(err));
  }
};

const server = micro(handler);
log.info('starting server', { port: config.port });
server.listen(config.port);
