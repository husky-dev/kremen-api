import { config } from '@config';
import { RedisClient } from './redis';
import { IncomingMessage } from 'http';
import url from 'url';

export const httpCache = (redis: RedisClient) => {
  const getCacheForReq = async (req: IncomingMessage) => {
    if (!config.cache.enabled) return undefined;
    const { pathname = '' } = req.url ? url.parse(req.url, true) : {};
    if (!pathname) return undefined;
    const key = `${config.cache.key}:http:${pathname}`;
    const data = await redis.get(key);
    return data ? data : undefined;
  };

  const setCacheForReq = async (req: IncomingMessage, data: unknown) => {
    if (!config.cache.enabled) return;
    const { pathname = '' } = req.url ? url.parse(req.url, true) : {};
    if (!pathname) return;
    const key = `${config.cache.key}:http:${pathname}`;
    return await redis.set(key, JSON.stringify(data));
  };

  return { getCacheForReq, setCacheForReq };
};
