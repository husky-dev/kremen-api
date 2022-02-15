import { config } from '@config';
import { initRedisClient, initSentry, log } from '@core';
import { errToStr } from '@utils';
import http from 'http';
import url from 'url';
import WebSocket from 'ws';

initSentry();
log.info('config', config);

const server = http.createServer();

const init = async () => {
  try {
    const redis = await initRedisClient();

    const wssTransport = new WebSocket.Server({ noServer: true });
    wssTransport.on('connection', () => {
      log.debug('new tranposrt connection');
    });
    redis.subscribe('kremen:transport:updates:buses', message => {
      log.debug('new tranposrt buses update', { message });
      wssTransport.clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(`{"type":"buses","data":${message}}`);
        }
      });
    });

    const wssEqipment = new WebSocket.Server({ noServer: true });
    wssEqipment.on('connection', () => {
      log.debug('new equipment connection');
    });
    redis.subscribe('kremen:equipment:updates:items', message => {
      log.debug('new equipment items update', { message });
      wssEqipment.clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(`{"type":"items","data":${message}}`);
        }
      });
    });

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
