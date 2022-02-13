import { IncomingMessage, ServerResponse } from 'http';
import { HttpQs, sendNotFoundErr, sendUnprocessableEntityErr } from './http';
import { isStr } from './types';
import url from 'url';

export interface HttpRoute {
  path: string | RegExp;
  method?: 'GET';
  handler: (req: IncomingMessage, res: ServerResponse, opt: HttpRouteHandlerOpt) => Promise<void>;
}

export type HttpRouteHandler = (req: IncomingMessage, res: ServerResponse, opt: HttpRouteHandlerOpt) => Promise<void>;

export interface HttpRouteHandlerOpt {
  query: HttpQs;
  params?: string[];
}

export const createHttpRouter = (routes: HttpRoute[]) => {
  const processReq = async (req: IncomingMessage, res: ServerResponse) => {
    const curMethod = req.method?.toUpperCase();
    if (!curMethod) return sendUnprocessableEntityErr(res, 'HTTP method is empty');
    const { pathname = '', query = {} } = req.url ? url.parse(req.url, true) : {};
    if (!isStr(pathname)) return sendUnprocessableEntityErr(res, 'HTTP path is empty');
    for (const route of routes) {
      const { path, method = 'GET', handler } = route;
      if (curMethod !== method) continue;
      if (isStr(path)) {
        if (pathname === path) return await handler(req, res, { query });
      } else {
        const match = path.exec(pathname);
        if (match) {
          const params = match.length === 1 ? undefined : match.slice(1).map(itm => `${itm}`);
          return await handler(req, res, { query, params });
        }
      }
    }
    return sendNotFoundErr(res, 'Endpoint not found');
  };
  return { processReq };
};
