import { getAppEnv, getAppName, getAppVersion, getLogLevelEnv, getNumEnv, getStrEnv, getStrEnvOrExit } from './utils';

export const config = {
  env: getAppEnv(),
  name: getAppName('kremen-watchman'),
  version: getAppVersion(),
  port: getNumEnv('PORT', 8080),
  log: {
    level: getLogLevelEnv('LOG_LEVEL', 'info'),
  },
  sentry: {
    dsn: getStrEnvOrExit('SENTRY_DSN'),
  },
  redis: {
    host: getStrEnv('REDIS_HOST', 'redis'),
    port: getNumEnv('REDIS_PORT', 6379),
  },
};

export * from './utils';
