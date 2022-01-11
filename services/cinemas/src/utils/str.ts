import { ValidationError, ValidationErrorItem } from 'joi';
import { isError, isFunction, isNumber, isString } from 'lodash';

import { isUnknownDict } from './types';

/**
 * Convert unknown error to string
 * @param err - Error, string, number or an object with `toString()` property
 */
export const errToStr = (err: unknown): string | undefined => {
  if (!err) {
    return undefined;
  }
  if (isError(err)) {
    return err.message;
  }
  if (isString(err)) {
    return err;
  }
  if (isNumber(err)) {
    return `${err}`;
  }
  if (isUnknownDict(err) && isString(err.message)) {
    return err.message;
  }
  // Rule disabled cos this is an edge case
  // eslint-disable-next-line @typescript-eslint/unbound-method
  if (isUnknownDict(err) && isFunction(err.toString)) {
    // Rule disabled cos this is an edge case
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return err.toString();
  }
  /* istanbul ignore next */
  return undefined;
};

export const joiErrToStr = (val: ValidationError): string => {
  const msgs = val.details.map(joiErrDetailItemToStr);
  return msgs.join('; ');
};

const joiErrDetailItemToStr = (val: ValidationErrorItem): string => {
  const { message, path, context } = val;
  const pathStr = path.map(itm => `${itm}`).join('.');
  return `${message} (path=${pathStr}, context=${JSON.stringify(context)})`;
};
