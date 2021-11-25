import { ServerResponse } from 'http';
import { compact } from 'lodash';
import { send } from 'micro';

export interface HttpQs {
  [key: string]: string | string[] | undefined;
}

export const parseIdsStr = (val: string): number[] =>
  compact(
    val.split(',').map(item => {
      const val = parseInt(item, 10);
      return isNaN(val) ? undefined : val;
    }),
  );

// Responses

export const sendOk = (res: ServerResponse, data: unknown) => send(res, 200, data);

export const sendErr = (res: ServerResponse, code: number, message: string) => send(res, code, { error: message });

export const sendNotFoundErr = (res: ServerResponse, message: string = 'Not found') => sendErr(res, 404, message);

export const sendInternalServerErr = (res: ServerResponse, message: string = 'Internal server error') =>
  sendErr(res, 500, message);
