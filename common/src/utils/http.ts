import { ServerResponse } from 'http';
import { send } from 'micro';

import { compact } from './types';

export interface HttpQs {
  [key: string]: string | string[] | undefined;
}

export const parseQueryIdsParam = (val: string): number[] =>
  compact(
    val.split(',').map(item => {
      const val = parseInt(item, 10);
      return isNaN(val) ? undefined : val;
    }),
  );

// Data

export const sendOk = <D = unknown>(res: ServerResponse, data?: D, opt?: ResponseOpt) => sendWithHeaders(res, 200, data, opt);

// Errors

export const sendErr = (res: ServerResponse, status: number, code: string, message?: string) =>
  sendWithHeaders(res, status, { code, message });

export const sendNotFoundErr = (res: ServerResponse, message: string = 'Not found') => sendErr(res, 404, 'NOT_FOUND', message);

export const sendParamMissedErr = (res: ServerResponse, name: string) =>
  sendErr(res, 422, 'PARAM_MISSED', `"${name}" param missed`);

export const sendWrongFormatErr = (res: ServerResponse, name: string) =>
  sendErr(res, 422, 'WRONG_FORMAT', `Wrong "${name}" format`);

export const sendInternalServerErr = (res: ServerResponse, message: string = 'Internal server error') =>
  sendErr(res, 500, 'INTERNAL_SERVER_ERROR', message);

export const sendDatasourceErr = (res: ServerResponse, message: string = 'Datasource error') =>
  sendErr(res, 503, 'DATASOURCE_ERROR', message);

// Headers

interface ResponseOpt {
  cors?: boolean;
  cache?: {
    type?: 'private' | 'public';
    sec?: number;
  };
  contentType?: string;
}

const setContentTypeHeaders = (res: ServerResponse, opt?: ResponseOpt) => {
  res.setHeader('Content-Type', opt?.contentType || 'application/json');
};

const setCorsHeaders = (res: ServerResponse, opt?: ResponseOpt) => {
  if (opt?.cors !== false) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
};

const setCacheHeaders = (res: ServerResponse, opt?: ResponseOpt) => {
  if (!opt || !opt.cache) return;
  const { cache } = opt;
  const parts: string[] = [];
  if (cache.type === 'private') parts.push('private');
  else parts.push('public');
  if (cache.sec) parts.push(`max-age=${cache.sec}`);
  if (parts.length) res.setHeader('Cache-Control', parts.join(', '));
};

// Response

const sendWithHeaders = (res: ServerResponse, code: number, data?: unknown, opt?: ResponseOpt) => {
  setCorsHeaders(res, opt);
  setCacheHeaders(res, opt);
  setContentTypeHeaders(res, opt);
  send(res, code, data);
};
