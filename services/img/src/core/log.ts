/* eslint-disable no-console */
import { config, LogLevel } from '@config';
import { select } from '@utils';

// import { captureSentryMsg, Severity } from './sentry';

const logLevelToNum = (val: LogLevel): number =>
  select(val, {
    err: 0,
    warn: 1,
    info: 2,
    debug: 3,
  });

const logLevelToSymbol = (val: LogLevel): string =>
  select(val, {
    err: 'x',
    warn: '!',
    info: '+',
    debug: '-',
  });

export const Log = (m?: string) => {
  const level = logLevelToNum(config.log.level);

  interface LogOpt {
    level: LogLevel;
    msg: string;
    meta?: unknown;
  }

  const logWithOpt = (opt: LogOpt) => {
    if (level < logLevelToNum(opt.level)) return;
    const levelPrefix = `[${logLevelToSymbol(opt.level)}]`;
    const prefix = m ? `${levelPrefix}[${m}]` : levelPrefix;
    const msg = `${prefix}: ${opt.msg}`;
    switch (opt.level) {
      case 'info':
        return opt.meta ? console.info(msg, JSON.stringify(opt.meta)) : console.info(msg);
      case 'err':
        return opt.meta ? console.error(msg, JSON.stringify(opt.meta)) : console.error(msg);
      case 'warn':
        return opt.meta ? console.warn(msg, JSON.stringify(opt.meta)) : console.warn(msg);
      default:
        return opt.meta ? console.log(msg, JSON.stringify(opt.meta)) : console.log(msg);
    }
  };

  return {
    err: (msg: string, meta?: unknown) => {
      // captureSentryMsg(msg, Severity.Error, meta);
      logWithOpt({ msg, meta, level: 'err' });
    },
    warn: (msg: string, meta?: unknown) => {
      // captureSentryMsg(msg, Severity.Warning, meta);
      logWithOpt({ msg, meta, level: 'warn' });
    },
    info: (msg: string, meta?: unknown) => logWithOpt({ msg, meta, level: 'info' }),
    debug: (msg: string, meta?: unknown) => logWithOpt({ msg, meta, level: 'debug' }),
    errAndExit: (msg: string, meta?: unknown) => {
      logWithOpt({ msg, meta, level: 'err' });
      process.exit(1);
    },
    simple: (...args: unknown[]) => console.log(...args),
    simpleAndExit: (...args: unknown[]) => {
      console.log(...args);
      process.exit(0);
    },
  };
};

export const log = Log();
