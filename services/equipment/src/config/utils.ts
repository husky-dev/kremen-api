/* eslint-disable no-console */
import { isNum, isStr, isUnknowDict } from '@utils';
import pckg from '../../package.json';

interface PackageContent {
  name: string;
  version: string;
}

const isPackageContent = (val: unknown): val is PackageContent => isUnknowDict(val) && isStr(val.name) && isStr(val.version);

if (!isPackageContent(pckg)) {
  console.error(`wrong package.json format`);
  process.exit(1);
}

const { name, version } = pckg;

export type ConfigEnv = 'development' | 'production';

export type LogLevel = 'none' | 'err' | 'warn' | 'info' | 'debug' | 'trace';

const isConfigEnv = (val: unknown): val is ConfigEnv => isStr(val) && ['development', 'production'].includes(val);

export const getAppEnv = (): ConfigEnv => {
  const val = process.env.NODE_ENV;
  if (isStr(val)) {
    const modStr = val.toLocaleLowerCase().trim();
    if (isConfigEnv(modStr)) {
      return modStr;
    }
  }
  return 'production';
};

export const getAppName = () => parseStrParamOrExit(name, 'name');

export const getAppVersion = () => parseStrParamOrExit(version, 'version');

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
