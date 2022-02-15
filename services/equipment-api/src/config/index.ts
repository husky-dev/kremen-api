import { getAppEnv, getAppName, getAppVersion, getBoolEnv, getLogLevelEnv, getNumEnv, getStrEnv, getStrEnvOrExit } from './utils';

export const config = {
  env: getAppEnv(),
  name: getAppName('kremen-equipment-api'),
  version: getAppVersion(),
  port: getNumEnv('PORT', 8080),
  log: {
    level: getLogLevelEnv('LOG_LEVEL', 'info'),
  },
  cache: {
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
  sentry: {
    dsn: getStrEnvOrExit('SENTRY_DSN'),
  },
};

export * from './utils';
