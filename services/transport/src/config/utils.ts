/* eslint-disable no-console */
import { isNum, isStr } from 'utils';

export type ConfigEnv = 'dev' | 'prd';

export type LogLevel = 'none' | 'err' | 'warn' | 'info' | 'debug' | 'trace';

const isConfigEnv = (val: unknown): val is ConfigEnv => isStr(val) && ['dev', 'prd'].includes(val);

export const getAppEnv = (): ConfigEnv => {
  const val = process.env.ENV;
  if (isStr(val)) {
    const modStr = val.toLocaleLowerCase().trim();
    if (isConfigEnv(modStr)) {
      return modStr;
    }
  }
  return 'prd';
};

export const getAppName = () => parseStrParam(NAME, 'moa-api');

export const getAppVersion = () => parseStrParam(VERSION, '0.0.0');

export const parseNumParam = (val: unknown, def: number): number => {
  if (isNum(val)) {
    return val;
  }
  if (isStr(val)) {
    const parsedVal = parseInt(val, 10);
    if (!isNaN(parsedVal)) {
      return parsedVal;
    }
  }
  return def;
};

export const parseStrParam = (val: unknown, def: string): string => {
  if (isNum(val)) {
    return `${val}`;
  }
  if (isStr(val)) {
    return val;
  }
  return def;
};

export const parseStrParamOrExit = (val: unknown, name: string): string => {
  if (!val) {
    console.error(`${name} param is not provided`);
    process.exit(1);
  }
  if (!isStr(val)) {
    console.log(`${name} param is not a string`);
    process.exit(1);
  }
  return val;
};

export const parseNumParamOrExit = (val: unknown, name: string): number => {
  if (!val) {
    console.error(`${name} param is not provided`);
    process.exit(1);
  }
  if (isStr(val)) {
    const pval = parseInt(val, 10);
    if (isNaN(pval)) {
      console.error(`${name} param is not a number`);
      process.exit(1);
    }
    return pval;
  }
  if (!isNum(val)) {
    console.error(`${name} param is not a number`);
    process.exit(1);
  }
  return val;
};

export const parseLogLevelParam = (val: unknown, def: LogLevel): LogLevel => {
  if (!val || !isStr(val)) return def;
  switch (val.toLocaleLowerCase()) {
    case 'none':
      return 'none';
    case 'err':
      return 'err';
    case 'error':
      return 'err';
    case 'warn':
      return 'warn';
    case 'warning':
      return 'warn';
    case 'info':
      return 'info';
    case 'debug':
      return 'debug';
    case 'trace':
      return 'trace';
    default:
      return 'err';
  }
};
