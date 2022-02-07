import { isErr, isFunc, isNum, isStr, isUnknownDict } from './types';

/**
 * Convert unknown error to string
 * @param err - Error, string, number or an object with `toString()` property
 */
export const errToStr = (err: unknown): string | undefined => {
  if (!err) {
    return undefined;
  }
  if (isErr(err)) {
    return err.message;
  }
  if (isStr(err)) {
    return err;
  }
  if (isNum(err)) {
    return `${err}`;
  }
  if (isUnknownDict(err) && isStr(err.message)) {
    return err.message;
  }
  if (isUnknownDict(err) && isFunc(err.toString)) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return err.toString();
  }
  return undefined;
};
