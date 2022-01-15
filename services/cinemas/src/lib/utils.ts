import { Log } from '@core';
import { isStr, wait } from '@utils';
import axios, { AxiosRequestHeaders, AxiosRequestConfig } from 'axios';
import iconv from 'iconv-lite';

const log = Log('lib.utils');

// const win1251ToUtf8Conv = Iconv('windows-1251', 'utf8');

export class DatasourceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// Getting data

interface HtmlReqOpt {
  url: string;
  cookies?: string;
  retry?: number;
}

export const getPageContent = async <D>({ url, cookies, retry = 0 }: HtmlReqOpt): Promise<D> => {
  const headers: AxiosRequestHeaders = {};
  if (cookies) headers.Cookie = cookies;
  const req: AxiosRequestConfig = {
    url,
    headers,
    responseType: 'arraybuffer',
    transformResponse: (data, headers) => {
      const contentType = headers ? headers['content-type'] : undefined;
      if (contentType && contentType.indexOf('1251') !== -1) {
        return iconv.decode(Buffer.from(data), 'windows-1251').toString();
      } else {
        return Buffer.from(data).toString('utf8');
      }
    },
    validateStatus: () => true,
  };
  try {
    const { data: body, status, statusText } = await axios(req);
    if (!isStatus200(status)) {
      if (isStr(body)) {
        throw new DatasourceError(body);
      } else {
        throw new DatasourceError(statusText);
      }
    }
    return body;
  } catch (err: unknown) {
    const waitMs = 2 ** retry * 100;
    log.debug('datasource req err, retry', { url, waitMs });
    await wait(waitMs);
    return getPageContent({ url, retry: retry + 1 });
  }
};

const isStatus200 = (val: number) => val >= 200 && val <= 299;

// Str

export const parseStr = (val: string) => val.trim();

export const parseCommaSepStr = (val: string, opt: { toLower: boolean } = { toLower: false }) =>
  val
    .split(',')
    .map(itm => itm.trim())
    .map(itm => (opt.toLower ? itm.toLowerCase() : itm));
