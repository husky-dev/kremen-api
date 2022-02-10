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

// Responses

export const sendOk = <D = unknown>(res: ServerResponse, data?: D) => sendWithHeaders(res, 200, data);

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

const sendWithHeaders = (res: ServerResponse, code: number, data?: unknown) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  send(res, code, data);
};
