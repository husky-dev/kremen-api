import { getAppEnv, getAppName, getAppVersion, getBoolEnv, getLogLevelEnv, getNumEnv } from './utils';
import path from 'path';

const cacheFolderPath = path.resolve(__dirname, '../cache');

export const config = {
  env: getAppEnv(),
  name: getAppName('kremen-transport-icons'),
  version: getAppVersion(),
  port: getNumEnv('PORT', 8080),
  log: {
    level: getLogLevelEnv('LOG_LEVEL', 'info'),
  },
  cache: {
    enabled: getBoolEnv('CACHE_ENABLED', false),
    folder: cacheFolderPath,
  },
};

export { LogLevel } from './utils';
