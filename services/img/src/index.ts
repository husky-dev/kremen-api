import { config } from '@config';
import { log, TransportType } from '@core';
import { getTransportIconCode } from '@lib';
import {
  createHttpRouter,
  daySec,
  errToStr,
  HttpRouteHandler,
  joiErrToStr,
  ResponseOptCache,
  sendInternalServerErr,
  sendOk,
  sendUnprocessableEntityErr,
} from '@utils';
import { IncomingMessage, ServerResponse } from 'http';
import micro from 'micro';
import sharp from 'sharp';
import Joi from 'joi';

// initSentry();
log.info('config', config);

interface TransportMarkerGetQuery {
  v?: string;
  d?: number;
  light?: string;
  dark?: string;
  direction?: number;
  number?: string;
  type?: TransportType;
}

const handleTransportMakerQuerySchema = Joi.object<TransportMarkerGetQuery>({
  v: Joi.string(),
  d: Joi.number().min(1).max(3),
  light: Joi.string(),
  dark: Joi.string(),
  direction: Joi.number().min(0).max(360),
  number: Joi.string(),
  type: Joi.string().valid('B', 'T'),
});

const handleTransportMarker: HttpRouteHandler = async (req, res, opt) => {
  const { error, value: query } = handleTransportMakerQuerySchema.validate(opt.query);
  if (error) return sendUnprocessableEntityErr(res, joiErrToStr(error));

  let density = 72;
  const type = query?.type || TransportType.Bus;
  const light = query?.light || '#E0535D';
  const dark = query?.dark || '#8E3339';
  const number = query?.number || '1';
  const direction = query?.direction || 180;
  if (query?.d) density = density * query.d;

  const data = await sharp(Buffer.from(getTransportIconCode(type, direction, number, light, dark)), { density })
    .png()
    .toBuffer();

  const cache: ResponseOptCache | undefined = config.env === 'dev' ? undefined : { type: 'public', sec: daySec * 365 };
  return await sendOk(res, data, { contentType: 'image/png', cache });
};

const handleHttpRequest = async (req: IncomingMessage, res: ServerResponse) => {
  const router = createHttpRouter([{ path: '/img/transport/marker', handler: handleTransportMarker }]);
  try {
    await router.processReq(req, res);
  } catch (err: unknown) {
    return sendInternalServerErr(res, errToStr(err));
  }
};

const start = async () => {
  try {
    const server = micro(handleHttpRequest);
    server.listen(config.port);

    process.on('SIGTERM', async () => {
      try {
        log.info('SIGTERM signal received');
        server.close();
      } catch (err: unknown) {
        log.err('SIGTERM signal processing err', { msg: errToStr(err) });
      }
    });
  } catch (err: unknown) {
    log.err('start server err', { msg: errToStr(err) });
  }
};

start();
