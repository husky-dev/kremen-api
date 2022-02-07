import { getAppEnv, getAppName, getAppVersion, getLogLevelEnv, getNumEnv } from './utils';

export const config = {
  env: getAppEnv(),
  name: getAppName(),
  version: getAppVersion(),
  port: getNumEnv('PORT', 8080),
  log: {
    level: getLogLevelEnv('LOG_LEVEL', 'info'),
  },
};

export * from './utils';
