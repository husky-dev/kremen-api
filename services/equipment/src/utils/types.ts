export interface UnknowDict {
  [index: string]: unknown;
}

export const isUnknowDict = (candidate: unknown): candidate is UnknowDict => typeof candidate === 'object' && candidate !== null;

export const isStr = (val: unknown): val is string => typeof val === 'string';
export const isBool = (val: unknown): val is boolean => typeof val === 'boolean';
export const isNum = (val: unknown): val is number => typeof val === 'number';
export const isErr = (val: unknown): val is Error => val instanceof Error;

export const select = <K extends string | number, T extends unknown>(key: K, data: Record<K, T>) => data[key];
