import { isStr, isUndef, isUnknownDict } from '@utils';
import { AxiosRequestConfig } from 'axios';

export interface ApiReqOpt {
  method?: AxiosRequestConfig['method'];
  path: string;
  params?: AxiosRequestConfig['params'];
}

export const isStaus200 = (val: number) => val >= 200 && val <= 299;

export interface ApiErrorResp {
  code: string;
  message?: string;
}

export const isApiErrorResp = (val: unknown): val is ApiErrorResp =>
  isUnknownDict(val) && isStr(val.code) && (isStr(val.message) || isUndef(val.message));

export class ApiError extends Error {
  public readonly code: string;
  constructor(code: string, message?: string) {
    super(message ? message : code);
    this.code = code;
    this.message = message ? message : code;
  }
}
