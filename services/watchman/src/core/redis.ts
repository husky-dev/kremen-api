import { config } from '@config';
import { Log } from './log';
import { errToStr } from '@utils';
import { createClient } from 'redis';

const log = Log('reids');

export type RedisClientType = ReturnType<typeof createClient>;

export const initRedisClient = async (): Promise<RedisClientType> => {
  const redisUrl = `redis://${config.redis.host}:${config.redis.port}`;
  const client = createClient({ url: redisUrl });

  client.on('error', err => log.err('redis client err', { err: errToStr(err) }));

  log.info(`connecting to redis`, { url: redisUrl });
  await client.connect();
  log.info(`connecting to redis done`);

  return client as RedisClientType;
};
