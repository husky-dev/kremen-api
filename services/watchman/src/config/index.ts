import {
  AppEnv,
  getAppEnv,
  getAppName,
  getAppVersion,
  LogLevel,
  parseLogLevelParam,
  parseNumParam,
  parseStrParam,
  parseStrParamOrExit,
} from './utils';

interface Config {
  env: AppEnv;
  name: string;
  version: string;
  port: number;
  log: {
    level: LogLevel;
  };
  sentry: {
    dsn: string;
  };
  mongodb: {
    host: string;
    port: number;
    name: string;
  };
  redis: {
    host: string;
    port: number;
  };
  cache: {
    nginxKey: string;
  };
}

export const config: Config = {
  env: getAppEnv(),
  name: getAppName(),
  version: getAppVersion(),
  port: parseNumParam(process.env.PORT, 8080),
  log: {
    level: parseLogLevelParam(process.env.LOG_LEVEL, 'info'),
  },
  sentry: {
    dsn: parseStrParamOrExit(process.env.SENTRY_DSN, 'SENTRY_DSN'),
  },
  mongodb: {
    host: parseStrParam(process.env.MONGODB_HOST, 'mongo'),
    port: parseNumParam(process.env.MONGODB_PORT, 27017),
    name: parseStrParam(process.env.MONGODB_NAME, 'kremen'),
  },
  redis: {
    host: parseStrParam(process.env.REDIS_HOST, 'redis'),
    port: parseNumParam(process.env.REDIS_PORT, 6379),
  },
  cache: {
    nginxKey: parseStrParam(process.env.NGINX_CACHE_KEY, 'kremen:nginx:cache'),
  },
};

export * from './utils';
