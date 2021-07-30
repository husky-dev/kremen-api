import { ConfigEnv, getAppEnv, getAppName, getAppVersion, LogLevel, parseLogLevelParam, parseNumParam } from './utils';

interface Config {
  env: ConfigEnv;
  name: string;
  version: string;
  port: number;
  log: {
    level: LogLevel;
  };
}

export const config: Config = {
  env: getAppEnv(),
  name: getAppName(),
  version: getAppVersion(),
  port: parseNumParam(process.env.PORT, 8080),
  log: {
    level: parseLogLevelParam(process.env.LOG_LEVEL, 'err'),
  },
};

export * from './utils';
