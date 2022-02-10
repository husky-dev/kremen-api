import { getAppEnv, getAppName, getAppVersion, getLogLevelEnv, getNumEnv, getStrEnvOrExit } from './utils';

export const config = {
  env: getAppEnv(),
  name: getAppName('kremen-cinemas-api'),
  version: getAppVersion(),
  port: getNumEnv('PORT', 8080),
  log: {
    level: getLogLevelEnv('LOG_LEVEL', 'info'),
  },
  sentry: {
    dsn: getStrEnvOrExit('SENTRY_DSN'),
  },
  bot: {
    token: getStrEnvOrExit('BOT_TOKEN'),
    webhook: getStrEnvOrExit('BOT_WEBHOOK'),
  },
};

export * from './utils';
