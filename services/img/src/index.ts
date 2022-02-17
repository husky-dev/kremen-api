import { config } from '@config';
import { addFileToCache, getFileFromCache, initCacheFolder, isCacheEnabled, log } from '@core';
import {
  getStationIcon,
  getTransportBusPinIconCode,
  getTransportBusIconFileName,
  TransportBusPinIcon,
  TransportBusPinQuerySchema,
  TransportStationPinIcon,
  TransportStationPinQuerySchema,
  getTransportStationIconFileName,
} from '@lib';
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

// initSentry();
log.info('config', config);

const handleTransportBusPin: HttpRouteHandler = async (req, res, opt) => {
  const { error, value: query } = TransportBusPinQuerySchema.validate(opt.query);
  if (error) return sendUnprocessableEntityErr(res, joiErrToStr(error));

  const icon: TransportBusPinIcon = {
    version: query?.v || 1,
    light: query?.light || '#E0535D',
    dark: query?.dark || '#8E3339',
    type: query?.type || 'trolleybus',
    number: query?.number || '1',
    direction: query?.direction || 180,
    density: query?.d ? query.d * 72 : 72,
    theme: query?.theme || 'light',
  };

  const cacheEnabled = isCacheEnabled(req.headers, opt.query);
  const cacheFileName = getTransportBusIconFileName(icon);
  const cacheHeader: ResponseOptCache | undefined =
    config.env === 'dev' || !cacheEnabled ? undefined : { type: 'public', sec: daySec * 365 };
  if (cacheEnabled) {
    const cachedFile = await getFileFromCache(cacheFileName);
    if (cachedFile) {
      log.debug('returning icon from cache', { ...icon });
      return sendOk(res, cachedFile, { contentType: 'image/png', cache: cacheHeader });
    }
  }

  log.debug('generating new icon', { ...icon });
  const data = await sharp(Buffer.from(getTransportBusPinIconCode(icon)), { density: icon.density })
    .png()
    .toBuffer();

  if (cacheEnabled) addFileToCache(cacheFileName, data);
  return await sendOk(res, data, { contentType: 'image/png', cache: cacheHeader });
};

const handleTransportStationPin: HttpRouteHandler = async (req, res, opt) => {
  const { error, value: query } = TransportStationPinQuerySchema.validate(opt.query);
  if (error) return sendUnprocessableEntityErr(res, joiErrToStr(error));

  const icon: TransportStationPinIcon = {
    version: query?.v || 1,
    density: query?.d ? query.d * 72 : 72,
    theme: query?.theme || 'light',
  };

  const cacheEnabled = isCacheEnabled(req.headers, opt.query);
  const cacheFileName = getTransportStationIconFileName(icon);
  const cacheHeader: ResponseOptCache | undefined =
    config.env === 'dev' || !cacheEnabled ? undefined : { type: 'public', sec: daySec * 365 };
  if (cacheEnabled) {
    const cachedFile = await getFileFromCache(cacheFileName);
    if (cachedFile) {
      log.debug('returning icon from cache');
      return sendOk(res, cachedFile, { contentType: 'image/png', cache: cacheHeader });
    }
  }

  const data = await sharp(Buffer.from(getStationIcon(icon)), { density: icon.density })
    .png()
    .toBuffer();

  if (cacheEnabled) addFileToCache(cacheFileName, data);
  return sendOk(res, data, { contentType: 'image/png', cache: cacheHeader });
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
    initCacheFolder();

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
