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

export interface UnknownDict {
  [index: string]: unknown;
}

export const isUnknownDict = (candidate: unknown): candidate is UnknownDict =>
  typeof candidate === 'object' && candidate !== null;

export const isStr = (val: unknown): val is string => typeof val === 'string';
export const isBool = (val: unknown): val is boolean => typeof val === 'boolean';
export const isNum = (val: unknown): val is number => typeof val === 'number';
export const isErr = (val: unknown): val is Error => val instanceof Error;
export const isUndef = (val: unknown): val is undefined => typeof val === 'undefined';
export const isArr = (val: unknown): val is unknown[] => Array.isArray(val);

export const select = <K extends string | number, T>(key: K, data: Record<K, T>) => data[key];
