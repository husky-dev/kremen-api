export interface UnknownDict {
  [index: string]: unknown;
}

export const isUnknownDict = (candidate: unknown): candidate is UnknownDict =>
  typeof candidate === 'object' && candidate !== null;

export const isStr = (val: unknown): val is string => typeof val === 'string';
export const isStrOrUndef = (val: unknown): val is string | undefined => isStr(val) || isUndef(val);
export const isStrArr = (val: unknown): val is string[] =>
  isArr(val) && val.reduce<boolean>((memo, itm) => memo && isStr(itm), true);
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
export const isFunc = (val: unknown): val is () => void => !!val && {}.toString.call(val) === '[object Function]';
export const isDate = (val: unknown): val is Date => val instanceof Date;
export const isErr = (val: unknown): val is Error => val instanceof Error;

export const last = <T = unknown>(val: T[]): T => val[val.length - 1];

export const select = <K extends string | number, T>(key: K, data: Record<K, T>) => data[key];

export const compact = <D>(arr: (D | null | undefined)[]): D[] => {
  const newArr: D[] = [];
  for (const itm of arr) {
    if (!isUndef(itm) && !isNull(itm)) newArr.push(itm);
  }
  return newArr;
};

export const unique = <D>(arr: D[]): D[] => {
  const items: D[] = [];
  for (const itm of arr) {
    if (!items.includes(itm)) items.push(itm);
  }
  return items;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const getObjectsDiff = <T extends Object>(prev: T, next: T): Partial<T> => {
  const res: Partial<T> = {};
  type K = keyof T;
  const keys: K[] = Object.keys(next) as unknown as K[];
  for (const key of keys) {
    if (next[key] !== prev[key]) {
      res[key] = next[key] as any;
    }
  }
  return res;
};
