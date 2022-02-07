import { getAppEnv, getAppName, getAppVersion, getLogLevelEnv, getNumEnv, getStrEnvOrExit } from './utils';

export const config = {
  env: getAppEnv(),
  name: getAppName(),
  version: getAppVersion(),
  port: getNumEnv('PORT', 8080),
  log: {
    level: getLogLevelEnv('LOG_LEVEL', 'info'),
  },
  bot: {
    token: getStrEnvOrExit('BOT_TOKEN'),
    webhook: getStrEnvOrExit('BOT_WEBHOOK'),
  },
};

export * from './utils';
