import { getAppEnv, getAppName, getAppVersion, getLogLevelEnv, getNumEnv, getStrEnv, getStrEnvOrExit } from './utils';

export const config = {
  env: getAppEnv(),
  name: getAppName('kremen-equipment-ds'),
  version: getAppVersion(),
  port: getNumEnv('PORT', 8080),
  log: {
    level: getLogLevelEnv('LOG_LEVEL', 'info'),
  },
  mongodb: {
    host: getStrEnv('MONGODB_HOST', 'mongo'),
    port: getNumEnv('MONGODB_PORT', 27017),
    name: getStrEnv('MONGODB_NAME', 'kremen'),
  },
  sentry: {
    dsn: getStrEnvOrExit('SENTRY_DSN'),
  },
};

export * from './utils';
