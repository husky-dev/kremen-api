import { IncomingMessage, ServerResponse } from 'http';
import { getApi } from 'lib';
import { send } from 'micro';
import { errToStr, HttpQs, isStr, parseIdsStr } from 'utils';
import url from 'url';

const sendOk = (res: ServerResponse, data: unknown) => send(res, 200, data);

const sendErr = (res: ServerResponse, code: number, message: string) => send(res, code, { error: message });

const sendNotFoundErr = (res: ServerResponse, message: string = 'Not found') => sendErr(res, 404, message);

const sendInternalServerErr = (res: ServerResponse, message: string = 'Internal server error') => sendErr(res, 500, message);

// Handlers

const api = getApi().withCity();

const handleRoutes = async (res: ServerResponse) => {
  const data = await api.getRoutesWithStations();
  return sendOk(res, data);
};

const handleBuses = async (res: ServerResponse, query: HttpQs) => {
  const rids = isStr(query.rids) ? parseIdsStr(query.rids) : undefined;
  const data = await api.getRoutesBuses(rids);
  return sendOk(res, data);
};

export default async (req: IncomingMessage, res: ServerResponse) => {
  const { pathname = '', query = {} } = req.url ? url.parse(req.url, true) : {};
  try {
    if (req.method === 'GET' && pathname === '/routes') {
      return handleRoutes(res);
    }
    if (req.method === 'GET' && pathname === '/buses') {
      return handleBuses(res, query);
    }
    return sendNotFoundErr(res, 'API not found');
  } catch (err: unknown) {
    return sendInternalServerErr(res, errToStr(err));
  }
};
