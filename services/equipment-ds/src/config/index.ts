import {
  ConfigEnv,
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
  env: ConfigEnv;
  name: string;
  version: string;
  port: number;
  log: {
    level: LogLevel;
  };
  mongodb: {
    host: string;
    port: number;
    name: string;
  };
  sentry: {
    dsn: string;
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
  mongodb: {
    host: parseStrParam(process.env.MONGODB_HOST, 'mongo'),
    port: parseNumParam(process.env.MONGODB_PORT, 27017),
    name: parseStrParam(process.env.MONGODB_NAME, 'kremen'),
  },
  sentry: {
    dsn: parseStrParamOrExit(process.env.SENTRY_DSN, 'SENTRY_DSN'),
  },
};

export * from './utils';
