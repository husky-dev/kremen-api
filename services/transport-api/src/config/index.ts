import { getAppEnv, getAppName, getAppVersion, getBoolEnv, getLogLevelEnv, getNumEnv, getStrEnv, getStrEnvOrExit } from './utils';

export const config = {
  env: getAppEnv(),
  name: getAppName('kremen-transport-api'),
  version: getAppVersion(),
  port: getNumEnv('PORT', 8080),
  log: {
    level: getLogLevelEnv('LOG_LEVEL', 'info'),
  },
  sentry: {
    dsn: getStrEnvOrExit('SENTRY_DSN'),
  },
  cahce: {
    enabled: getBoolEnv('CACHE_ENABLED', true),
    key: getStrEnv('CACHE_KEY', 'kremen:cache:transport'),
  },
  mongodb: {
    host: getStrEnv('MONGODB_HOST', 'mongo'),
    port: getNumEnv('MONGODB_PORT', 27017),
    name: getStrEnv('MONGODB_NAME', 'kremen'),
  },
  redis: {
    host: getStrEnv('REDIS_HOST', 'redis'),
    port: getNumEnv('REDIS_PORT', 6379),
  },
};

export * from './utils';
