import { config } from '@config';
import { initSentry, log } from '@core';
import { cinemasBot } from '@lib';
import { errToStr, sendInternalServerErr, sendNotFoundErr, sendOk } from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import micro, { json } from 'micro';
import url from 'url';

initSentry();
log.info('config', config);

const handler = async (req: IncomingMessage, res: ServerResponse) => {
  const { method } = req;

  const { pathname = '' } = req.url ? url.parse(req.url, true) : {};
  if (!pathname) return sendNotFoundErr(res, 'Endpoint not found');
  try {
    if (method === 'GET' && pathname === '/cinemas/ping') {
      return await sendOk(res, { version: config.version });
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
