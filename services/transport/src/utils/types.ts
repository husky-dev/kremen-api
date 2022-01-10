export interface UnknowDict {
  [index: string]: unknown;
}

export const isUnknownDict = (candidate: unknown): candidate is UnknowDict => typeof candidate === 'object' && candidate !== null;

export const select = <K extends string | number, T>(key: K, data: Record<K, T>) => data[key];

export const isErr = (val: unknown): val is Error => val instanceof Error;

export const isStr = (val: unknown): val is string => typeof val === 'string';

export const isStrOrUndef = (val: unknown): val is string | undefined => isStr(val) || isUndef(val);

export const isNum = (val: unknown): val is number => typeof val === 'number';

export const isNumOrUndef = (val: unknown): val is number => typeof val === 'number' || isUndef(val);

export const isNumArr = (val: unknown): val is number[] =>
  isArr(val) && val.reduce<boolean>((memo, itm) => isNum(itm) && memo, true);

export const isNumArrOrUndef = (val: unknown): val is number[] | undefined => isNumArr(val) || isUndef(val);

export const isBool = (val: unknown): val is boolean => typeof val === 'boolean';

export const isBoolOrUndef = (val: unknown): val is boolean | undefined => isBool(val) || isUndef(val);

export const isNull = (val: unknown): val is null => val === null;

export const isUndef = (val: unknown): val is undefined => typeof val === 'undefined';

export const isArr = (val: unknown): val is unknown[] => Array.isArray(val);
