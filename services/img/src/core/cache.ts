import { config } from '@config';
import { errToStr, HttpQs } from '@utils';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync, readFileSync } from 'fs';
import { IncomingHttpHeaders } from 'http';
import path from 'path';

import { Log } from './log';

const log = Log('core.cache');

// Folder

export const initCacheFolder = () => {
  checkCacheFolder();
};

export const addFileToCache = async (fileName: string, content: Buffer) => {
  const filePath = path.resolve(config.cache.folder, fileName);
  try {
    writeFileSync(filePath, content);
  } catch (err: unknown) {
    log.err('caching page content to file err', { fileName, filePath, msg: errToStr(err) });
  }
};

export const getFileFromCache = async (fileName: string): Promise<Buffer | undefined> => {
  if (!(await isFileInCache(fileName))) return undefined;
  const filePath = path.resolve(config.cache.folder, fileName);
  return readFileSync(filePath);
};

const isFileInCache = async (fileName: string) => {
  const filePath = path.resolve(config.cache.folder, fileName);
  return existsSync(filePath);
};

export const clearCacheFolder = () => {
  if (!existsSync(config.cache.folder)) return;
  const items = readdirSync(config.cache.folder);
  for (const item of items) {
    rmSync(path.resolve(config.cache.folder, item), { recursive: true, force: true });
  }
};

const checkCacheFolder = () => mkdirp(config.cache.folder);

const listFilesInFolder = (folderPath: string, extensions?: string[]) => {
  const res: string[] = [];
  const items = readdirSync(folderPath);
  for (const item of items) {
    const itemPath = path.resolve(folderPath, item);
    const stat = statSync(itemPath);
    if (stat.isDirectory()) {
      const newItems = listFilesInFolder(itemPath, extensions);
      res.push(...newItems);
    } else if (isFileExtensionInList(itemPath, extensions)) {
      res.push(itemPath);
    }
  }
  return res;
};

const isFileExtensionInList = (filePath: string, extensions?: string[]) => {
  if (!extensions) return true;
  const ext = path.extname(filePath);
  if (!ext) return false;
  return extensions.includes(ext.substring(1).toLocaleLowerCase());
};

const mkdirpWithFilePath = (filePath: string) => mkdirp(path.parse(filePath).dir);

const mkdirp = (folderPath: string) => mkdirSync(folderPath, { recursive: true });

// Utils

export const isCacheEnabled = (headers: IncomingHttpHeaders, query: HttpQs) => {
  if (!config.cache.enabled) return false;
  if (headers['X-Cache-Enabled'] === 'false') return false;
  if (query['cache'] === 'false' || query['cache'] === '0') return false;
  return true;
};
