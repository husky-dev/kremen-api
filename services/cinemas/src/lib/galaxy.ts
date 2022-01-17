import { Log } from '@core';
import { errToStr, compact, isStr } from '@utils';
import {
  KremenCinema,
  KremenCinemaMovie,
  KremenCinemaMovieFormat,
  KremenCinemaMovieType,
  KremenCinemaPrices,
  KremenCinemaProposal,
  KremenCinemaSession,
} from './types';
import * as cheerio from 'cheerio';
import { getPageContent, parseCommaSepStr, parseStr } from './utils';
import { CheerioAPI, Element } from 'cheerio';

const log = Log('lib.galaxy');

export const getCinema = async (): Promise<KremenCinema> => {
  const data: Omit<KremenCinema, 'movies'> = {
    id: 'galaxy',
    title: 'Галактика Кіно',
    logo: 'http://www.galaktika-kino.com.ua/images/logotype.png',
    address: 'ТРК "Галактика", вулиця Соборна, 21, Кременчук, Полтавська область, 39600',
    website: 'http://www.galaktika-kino.com.ua/',
    location: {
      lat: 49.0690987,
      lng: 33.4149385,
    },
    contacts: [
      { type: 'phone', value: '0800211504' },
      { type: 'instagram', value: 'https://www.instagram.com/galaktika.kino/' },
      { type: 'fb', value: 'https://fb.me/galaktika.kino.kremenchug' },
    ],
  };
  try {
    const movies = await getMovies();
    return { ...data, movies };
  } catch (err: unknown) {
    log.err('getting data err', { msg: errToStr(err) });
    return { ...data, movies: [] };
  }
};

const getMovies = async (): Promise<KremenCinemaMovie[]> => {
  const going = await getMoviesDataFromUrl('http://www.galaktika-kino.com.ua/razdel/uje-na-ekranah.php', 'going');
  const coming = await getMoviesDataFromUrl('http://www.galaktika-kino.com.ua/razdel/blijayshie-premeri.php', 'coming');
  const rawProposals = await parseProposalsPage('http://www.galaktika-kino.com.ua/main/price.php');
  const rawMovies = [...going, ...coming];
  const movies = rawMovies.map(itm => {
    const proposals = getProposalsForMovie(itm, rawProposals);
    if (itm.type === 'going' && !proposals.length) {
      log.warn(`the movie "${itm.title}" marked as going, but no proposals found`, { movie: itm, proposals: rawProposals });
    }
    return { ...itm, proposals };
  });
  return movies;
};

const getMoviesDataFromUrl = async (url: string, type: KremenCinemaMovieType): Promise<KremenCinemaMovie[]> => {
  const urls = await getMovieUrlsFromPage(url);
  const data = await Promise.all(urls.map(itm => getMovieDataFromPage(itm, type)));
  return data;
};

const getMovieUrlsFromPage = async (url: string) => {
  const html = await getPageContent<string>({ url });
  const $ = cheerio.load(html);
  const urls = $('.kino a')
    .map((index, itm) => $(itm).attr('href'))
    .toArray();
  const modUrls = urls.map(itm => fixUrlPath(itm));
  return compact(modUrls);
};

const getMovieDataFromPage = async (url: string, type: KremenCinemaMovieType): Promise<KremenCinemaMovie> => {
  const html = await getPageContent<string>({ url });
  const $ = cheerio.load(html);
  const id = parseMovieIdFromUrl(url);
  const title = parseStr($('h1').text());
  const poster = fixUrlPath($('.kino img').attr('src'));
  const trailer = $('.trailer iframe').attr('src');
  const description = parseStr($('.description').text());
  const info = getMovieInfo($);
  return { id, title, type, url, poster, trailer, description, ...info, proposals: [] };
};

const parseMovieIdFromUrl = (url: string) => {
  if (!url) return url;
  const parts = url.split('/');
  if (!parts.length) return url;
  const rawId = parts[parts.length - 1];
  return rawId.replace('.php', '').trim().toLowerCase();
};

const getMovieInfo = ($: CheerioAPI): Partial<KremenCinemaMovie> => {
  const rows = $('.parametrs .table .tr').toArray();
  const arr = rows.map(itm => ({ name: $('.td:nth-child(1)', itm).text(), value: $('.td:nth-child(2)', itm).text() }));
  const obj: Partial<KremenCinemaMovie> = {};
  const custom: Record<string, string> = {};
  for (const itm of arr) {
    const { name, value } = itm;
    if (!name) continue;
    const modName = name.toLocaleLowerCase();
    if (modName.indexOf('формат') !== -1) obj.format = parseStr(value);
    else if (modName.indexOf('жанр') !== -1) obj.genre = parseCommaSepStr(parseStr(value), { toLower: true });
    else if (modName.indexOf('режисер') !== -1) obj.director = parseStr(value);
    else if (modName.indexOf('актори') !== -1) obj.actors = parseCommaSepStr(parseStr(value));
    else if (modName.indexOf(`виробництво`) !== -1) obj.country = parseStr(value);
    else if (modName.indexOf(`тривалість`) !== -1) obj.duration = parseStr(value);
    else if (modName.indexOf(`сеанси`) !== -1) obj.start = parseStr(value);
    else if (modName.indexOf(`зал`) !== -1) continue;
    else custom[modName] = parseStr(value);
  }
  return Object.keys(custom).length ? { ...obj, custom } : obj;
};

// Proposals

interface Proposal {
  hallId: number;
  hallScheme?: string;
  description?: string;
  sessions: (KremenCinemaSession & { title: string })[];
}

const parseProposalsPage = async (url: string) => {
  const html = await getPageContent<string>({ url });
  const $ = cheerio.load(html);
  const proposals = $('.par .raspisanie')
    .toArray()
    .map(itm => parseProposalTableItem($, itm));
  return compact(proposals);
};

const parseProposalTableItem = ($: CheerioAPI, table: Element): Proposal | undefined => {
  const date = $(table).data('day');
  if (!isStr(date)) {
    log.warn('unable to parse date', { html: $(table).toString() });
    return undefined;
  }
  const hallId = parseHallId($('.big', table).text());
  const description = parseStr($('.cl', table).text());
  const schemeUrlRaw = $('.ar a', table).attr('href');
  const hallScheme = schemeUrlRaw ? `http://www.galaktika-kino.com.ua${schemeUrlRaw}` : undefined;
  const rows = $('.table .tr', table).toArray();
  const sessions: Proposal['sessions'] = [];
  for (const row of rows) {
    const titleRaw = $('.td:nth-child(1)', row).text();
    const timeRaw = $('.td:nth-child(2)', row).text();
    const pricesRaw = $('.td:nth-child(3)', row).text();
    if (/\d{2}:\d{2}/g.exec(timeRaw)) {
      const { title, format } = parseTitle(titleRaw);
      const time = `${timeRaw}:00`;
      const prices = parsePrices(pricesRaw);
      sessions.push({ title, format, date, time, prices });
    }
  }
  return { hallId, hallScheme, description, sessions };
};

const parseHallId = (val: string): number => {
  const match = /\d+/g.exec(val);
  return match ? parseInt(match[0], 10) : 0;
};

const parseTitle = (val: string): { title: string; format: KremenCinemaMovieFormat } => {
  const mUsual = /("|«)([\s\S]+?)("|»)\s*?(\d)D/g.exec(val);
  if (mUsual) {
    const title = mUsual[2];
    const format: KremenCinemaMovieFormat = mUsual[4] === '3' ? '3D' : '2D';
    return { title, format };
  }
  const mTitle = /("|«)([\s\S]+?)("|»)/g.exec(val);
  if (mTitle) {
    const title = mTitle[2];
    return { title, format: '2D' };
  }
  return { title: val, format: '2D' };
};

const parsePrices = (val: string): KremenCinemaPrices => {
  const mTwo = /(\d+)\s+?(\d+)/.exec(val);
  if (mTwo) return { usual: parseInt(mTwo[1], 10), vip: parseInt(mTwo[2], 10) };
  const mSingle = /(\d+)/.exec(val);
  if (mSingle) return { usual: parseInt(mSingle[1], 10) };
  log.warn('unable to parse a price', { val });
  return {};
};

const getProposalsForMovie = (movie: KremenCinemaMovie, proposals: Proposal[]): KremenCinemaProposal[] => {
  const title = simplifyTitle(movie.title);
  const items: KremenCinemaProposal[] = [];
  for (const proposal of proposals) {
    const propSessions = proposal.sessions.filter(session => simplifyTitle(session.title) === title);
    if (!propSessions.length) continue;
    const { hallId, hallScheme, description } = proposal;
    const sessions: KremenCinemaSession[] = propSessions.map(({ title, ...data }) => data);
    const id = `${sessions[0].date}-hall-${hallId}-${movie.id}`;
    items.push({ id, hallId, hallScheme, description, sessions });
  }
  return items;
};

const simplifyTitle = (val: string) =>
  val
    .trim()
    .toLowerCase()
    .replace(/[^A-zА-я]+/, '');

// Utils

const fixUrlPath = (val?: string): string | undefined => {
  if (!val) return val;
  return val.replace('..', 'http://www.galaktika-kino.com.ua');
};
