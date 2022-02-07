/* eslint-disable no-console */
import { isNum, isStr, isUnknownDict } from '@utils';
import pckg from '../../package.json';

interface PackageContent {
  name: string;
  version: string;
}

const isPackageContent = (val: unknown): val is PackageContent => isUnknownDict(val) && isStr(val.name) && isStr(val.version);

if (!isPackageContent(pckg)) {
  console.error(`wrong package.json format`);
  process.exit(1);
}

const { version, name } = pckg;

export type ConfigEnv = 'dev' | 'prd';

export type LogLevel = 'none' | 'err' | 'warn' | 'info' | 'debug';

export const getAppEnv = (): ConfigEnv => {
  const val = process.env.NODE_ENV;
  if (!isStr(val)) return 'prd';
  const modStr = val.toLocaleLowerCase().trim();
  if (modStr === 'prd') return 'prd';
  if (modStr === 'production') return 'prd';
  if (modStr === 'dev') return 'dev';
  if (modStr === 'development') return 'dev';
  return 'prd';
};

export const getAppVersion = () => {
  if (!version || !isStr(version)) {
    console.error(`"version" param is empty`);
    return process.exit(1);
  }
  return version;
};

export const getAppName = () => {
  if (!name || !isStr(name)) {
    console.error(`"name" param is empty`);
    return process.exit(1);
  }
  return name;
};

export const getNumEnv = (name: string, def: number): number => {
  const val = process.env[name];
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

export const getStrEnv = (name: string, def: string): string => {
  const val = process.env[name];
  if (isNum(val)) {
    return `${val}`;
  }
  if (isStr(val)) {
    return val;
  }
  return def;
};

export const getStrEnvOrExit = (name: string): string => {
  const val = process.env[name];
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

export const getNumEnvOrExit = (name: string): number => {
  const val = process.env[name];
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

export const getLogLevelEnv = (name: string, def: LogLevel): LogLevel => {
  const val = process.env[name];
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
    default:
      return 'err';
  }
};
