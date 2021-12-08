import { config } from '@config';
import { initMongoClient, initRedisClient, log } from '@core';
import { initEquipmentWatcher, initTransprotWatcher } from '@lib';
import * as Sentry from '@sentry/node';
import { errToStr } from '@utils';
import http from 'http';
import url from 'url';
import WebSocket from 'ws';

log.info('config', config);

Sentry.init({
  dsn: config.sentry.dsn,
  tracesSampleRate: 1.0,
  environment: config.env,
  debug: config.env === 'development' ? true : false,
  release: `${config.name.replace('@kremen/', '')}@${config.version}`,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

const server = http.createServer();

const init = async () => {
  try {
    const mongo = await initMongoClient();
    const redis = await initRedisClient();

    const wssTransport = new WebSocket.Server({ noServer: true });
    initTransprotWatcher({ wss: wssTransport, mongo, redis });

    const wssEqipment = new WebSocket.Server({ noServer: true });
    initEquipmentWatcher({ wss: wssEqipment, mongo, redis });

    server.on('upgrade', (request, socket, head) => {
      if (!request.url) return;
      const pathname = url.parse(request.url).pathname;

      if (pathname === '/transport/realtime') {
        wssTransport.handleUpgrade(request, socket, head, ws => {
          wssTransport.emit('connection', ws, request);
        });
      } else if (pathname === '/equipment/realtime') {
        wssEqipment.handleUpgrade(request, socket, head, ws => {
          wssEqipment.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    log.info(`statting wss, port=${config.port}, env=${config.env}`);
    server.listen(config.port);
  } catch (err: unknown) {
    log.err('init err', { err: errToStr(err) });
    process.exit(1);
  }
};

init();
