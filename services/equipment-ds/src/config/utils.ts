/* eslint-disable no-console */
import { isNum, isStr, isUnknownDict } from '@utils';
import { execSync } from 'child_process';
import pckg from '../../package.json';

// Env

export type AppEnv = 'prd' | 'dev';

const isAppEnv = (val: unknown): val is AppEnv => isStr(val) && ['prd', 'dev'].includes(val);

export const getAppEnv = (): AppEnv => {
  const val = process.env.NODE_ENV;
  if (!isStr(val)) return 'prd';
  const modStr = val.toLocaleLowerCase().trim();
  return isAppEnv(modStr) ? modStr : 'prd';
};

// Log level

export type LogLevel = 'err' | 'warn' | 'info' | 'debug';

const isLogLevel = (val: unknown): val is LogLevel => isStr(val) && ['err', 'warn', 'info', 'debug'].includes(val);

export const getLogLevelEnv = (name: string, def: LogLevel): LogLevel => {
  const val = process.env[name];
  if (!isStr(val)) return def;
  const modStr = val.toLocaleLowerCase().trim();
  return isLogLevel(modStr) ? modStr : 'err';
};

// Package

interface AppPackage {
  name: string;
  version: string;
}

const isAppPackage = (val: unknown): val is AppPackage => isUnknownDict(val) && isStr(val.version);

export const getAppName = (def: string): string => (isAppPackage(pckg) ? pckg.name : def);
export const getAppVersion = (): string => (isAppPackage(pckg) ? pckg.version : '0.0.0');

// Envs

export const getNumEnv = (name: string, def: number): number => {
  const val = process.env[name];
  removeEnvVariable(name);
  if (isNum(val)) return val;
  if (isStr(val)) {
    const parsedVal = parseInt(val, 10);
    if (!isNaN(parsedVal)) return parsedVal;
  }
  return def;
};

export const getBoolEnv = (name: string, def: boolean): boolean => {
  const val = process.env[name];
  removeEnvVariable(name);
  if (isNum(val)) {
    return val === 0 ? false : true;
  }
  if (isStr(val)) {
    const modVal = val.toLocaleLowerCase().trim();
    if (modVal === 'true' || modVal === '1') return true;
    if (modVal === 'false' || modVal === '0') return false;
  }
  return def;
};

export const getStrEnv = (name: string, def: string): string => {
  const val = process.env[name];
  removeEnvVariable(name);
  if (isNum(val)) return `${val}`;
  if (isStr(val)) return val;
  return def;
};

export const getStrEnvOrExit = (name: string) => {
  const val = process.env[name];
  removeEnvVariable(name);
  if (!val) {
    console.error(`"${name}" environment variable is not provided`);
    process.exit(1);
  }
  if (!isStr(val)) {
    console.log(`"${name}" environment variable is not a string`);
    process.exit(1);
  }
  return val;
};

const removeEnvVariable = (name: string) => {
  execSync(`unset ${name}`);
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete process.env[name];
};
