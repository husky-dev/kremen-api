import { config } from '@config';
import { log, TransportType } from '@core';
import { getStationIcon, getTransportIconCode } from '@lib';
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

interface TransportBusPinQuery {
  v?: string;
  d?: number;
  light?: string;
  dark?: string;
  direction?: number;
  number: string;
  type?: 'bus' | 'trolleybus';
}

const TransportBusPinQuerySchema = Joi.object<TransportBusPinQuery>({
  v: Joi.string(),
  d: Joi.number().min(1).max(3),
  light: Joi.string(),
  dark: Joi.string(),
  direction: Joi.number().min(0).max(360),
  number: Joi.string().required(),
  type: Joi.string().valid('bus', 'trolleybus'),
});

const handleTransportBusPin: HttpRouteHandler = async (req, res, opt) => {
  const { error, value: query } = TransportBusPinQuerySchema.validate(opt.query);
  if (error) return sendUnprocessableEntityErr(res, joiErrToStr(error));

  let density = 72;
  let type = TransportType.Bus;
  if (query?.type === 'trolleybus') type = TransportType.Trolleybus;
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

interface TransportStationPinQuery {
  v?: string;
  d?: number;
}

const TransportStationPinQuerySchema = Joi.object<TransportStationPinQuery>({
  v: Joi.string(),
  d: Joi.number().min(1).max(3),
});

const handleTransportStationPin: HttpRouteHandler = async (req, res, opt) => {
  const { error, value: query } = TransportStationPinQuerySchema.validate(opt.query);
  if (error) return sendUnprocessableEntityErr(res, joiErrToStr(error));

  let density = 72;
  if (query?.d) density = density * query.d;

  const data = await sharp(Buffer.from(getStationIcon()), { density }).png().toBuffer();

  const cache: ResponseOptCache | undefined = config.env === 'dev' ? undefined : { type: 'public', sec: daySec * 365 };
  return await sendOk(res, data, { contentType: 'image/png', cache });
};

const handleHttpRequest = async (req: IncomingMessage, res: ServerResponse) => {
  const router = createHttpRouter([
    { path: '/img/transport/bus/pin', handler: handleTransportBusPin },
    { path: '/img/transport/station/pin', handler: handleTransportStationPin },
  ]);
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
