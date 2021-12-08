import {
  ConfigEnv,
  getAppEnv,
  getAppName,
  getAppVersion,
  LogLevel,
  parseLogLevelParam,
  parseNumParam,
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
  sentry: {
    dsn: parseStrParamOrExit(process.env.SENTRY_DSN, 'SENTRY_DSN'),
  },
};

export * from './utils';
