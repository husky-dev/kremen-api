import { getAppEnv, getAppName, getAppVersion, getLogLevelEnv, getNumEnv } from './utils';

export const config = {
  env: getAppEnv(),
  name: getAppName('kremen-transport-icons'),
  version: getAppVersion(),
  port: getNumEnv('PORT', 8080),
  log: {
    level: getLogLevelEnv('LOG_LEVEL', 'info'),
  },
};

export { LogLevel } from './utils';
