import { Log } from '@core';
import { compact, errToStr, isStr, isUnknownDict, joiErrToStr } from '@utils';
import * as cheerio from 'cheerio';
import { CheerioAPI, Element } from 'cheerio';
import Joi from 'joi';
import { Cinema, CinemaMovie, CinemaMovieFormat, CinemaMovieType, CinemaPrices, CinemaProposal, CinemaSession } from '@core';
import { getPageContent, parseCommaSepStr, parseStr, parseTrailerUrl } from './utils';

const log = Log('lib.cinemas.filmax');

const cookies =
  'locChose=435ddc275a03c43b535e95843b6ab32f7e1a0c570483826f8ed5167dc61c7889a%3A2%3A%7Bi%3A0%3Bs%3A8%3A%22locChose%22%3Bi%3A1%3Bi%3A1%3B%7D; region=dd65784c8dc0ca20d697e25fede51dba12a93d7853035642cf74fd5345211d48a%3A2%3A%7Bi%3A0%3Bs%3A6%3A%22region%22%3Bi%3A1%3Bs%3A1%3A%227%22%3B%7D';

export const getCinema = async (): Promise<Cinema> => {
  const data: Omit<Cinema, 'movies'> = {
    id: 'filmax',
    title: 'Filmax',
    logo: 'https://filmax.ua/movies/img/filmax-logo.png',
    address: 'Проспект Лесі Українки, 96, Кременчук, Полтавська область, 39600',
    website: 'https://filmax.ua/',
    location: {
      lat: 49.121436,
      lng: 33.4379874,
    },
    contacts: [
      { type: 'phone', value: '+380997362975' },
      { type: 'instagram', value: 'https://www.instagram.com/filmax.kremenchuk/' },
    ],
  };
  try {
    const movies = await getMovies();
    return { ...data, movies };
  } catch (err: unknown) {
    log.err('getting filmax data err', { msg: errToStr(err) });
    return { ...data, movies: [] };
  }
};

const getMovies = async () => {
  const html = await getPageContent<string>({ url: 'https://filmax.ua', cookies });
  const $ = cheerio.load(html);
  const sections = $('.page__content section.cards').toArray();
  const arrs = await Promise.all(sections.map(itm => parseHomePageSection($, itm)));
  const data: CinemaMovie[] = [];
  for (const arr of arrs) {
    data.push(...arr);
  }
  return data;
};

const parseHomePageSection = async ($: CheerioAPI, el: Element): Promise<CinemaMovie[]> => {
  const title = $('h2', el).text();
  const type = parseHomePageSessionTitle(title) || 'coming';
  const cards = $('article.preview-card', el).toArray();
  const movies = await Promise.all(cards.map(itm => parseHomePageMovie($, itm, type)));
  return movies.map(itm => ({ ...itm, type }));
};

const parseHomePageMovie = async ($: CheerioAPI, el: Element, type: CinemaMovieType): Promise<CinemaMovie> => {
  const title = $('h3 a', el).text();
  const url = parseUrl($('h3 a', el).attr('href')) || '';
  const id = urlToMovideId(url);
  const poster = parseUrl($('picture img', el).attr('src'));
  let proposals: CinemaProposal[] = [];
  try {
    if (id) {
      const schedule = await getSchedule(id);
      proposals = schedule.data.map(parseSession);
    }
  } catch (err: unknown) {
    log.err('getting movie schedule err', { id, title, url, msg: errToStr(err) });
  }
  let info: Partial<CinemaMovie> = {};
  try {
    if (url) {
      info = await getMovideInfo(url);
    }
  } catch (err: unknown) {
    log.err('getting movie info err', { id, title, url, msg: errToStr(err) });
  }
  return { id: `${id}`, type, title, url, poster, ...info, proposals };
};

const parseHomePageSessionTitle = (val: string): CinemaMovieType | undefined => {
  if (val.toLowerCase().indexOf('зараз') >= 0) return 'going';
  if (val.toLowerCase().indexOf('скоро') >= 0) return 'coming';
  return undefined;
};

const parseUrl = (val?: string): string | undefined => {
  if (!val) return val;
  const modVal = val.trim();
  return modVal.indexOf('/') === 0 ? `https://filmax.ua${modVal}` : modVal;
};

const urlToMovideId = (val?: string): number | undefined => {
  if (!val) return undefined;
  const match = /movie\/(\d+)$/g.exec(val);
  return match ? parseInt(match[1], 10) : undefined;
};

const parseSession = (val: DSGetScheduleSessions): CinemaProposal => {
  const { id, cinema_hall_id: hallId, price, price_stock, format_id, vip, date_data } = val;
  const prices: CinemaPrices = { stock: parsePrice(price_stock) };
  if (vip === 1) prices.vip = parsePrice(price);
  else prices.usual = parsePrice(price);
  const format: CinemaMovieFormat = format_id === 0 ? '2D' : '3D';
  const sessions: (CinemaSession | undefined)[] = date_data.map(itm => {
    const date = parseDateDataItem(itm);
    return date ? { ...date, prices, format } : undefined;
  });
  return { id: `${id}`, hallId, sessions: compact(sessions) };
};

const parseDateDataItem = (val: string): { date: string; time: string } | undefined => {
  const m = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/g.exec(val);
  if (!m) {
    log.warn('parsing date date item err', { val: val });
    return undefined;
  }
  const date = `${m[1]}-${m[2]}-${m[3]}`;
  const time = `${m[4]}:${m[5]}:${m[6]}`;
  return { date, time };
};

const parsePrice = (val: string) => {
  if (!val) return undefined;
  const num = parseInt(val, 10);
  return !isNaN(num) ? num : undefined;
};

// Schedule

const getSchedule = async (id: number): Promise<DSGetScheduleResp> => {
  const url = `https://filmax.ua/movie-schedule/${id}`;
  const data = await getPageContent<DSGetScheduleResp>({ url, cookies });
  const { error: validationErr } = DSGetScheduleRespSchema.validate(data);
  if (validationErr) {
    log.warn('wrong schedule format', { msg: joiErrToStr(validationErr) });
  }
  return data;
};

interface DSGetScheduleSessions {
  id: number;
  cinema_hall_id: number;
  price: string;
  price_stock: string;
  format_id: number;
  vip: number;
  date_data: string[];
}

const DSGetScheduleSessionsSchema = Joi.object<DSGetScheduleSessions>({
  id: Joi.number().required(),
  cinema_hall_id: Joi.number().required(),
  price: Joi.string().required(),
  price_stock: Joi.string().allow('').required(),
  format_id: Joi.number().required(),
  vip: Joi.number().required(),
  date_data: Joi.array().items(Joi.string()),
});

interface DSGetScheduleResp {
  status: 'success';
  data: DSGetScheduleSessions[];
}

const DSGetScheduleRespSchema = Joi.object<DSGetScheduleResp>({
  status: Joi.string().required(),
  data: Joi.array().items(DSGetScheduleSessionsSchema),
});

interface DSGetScheduleErr {
  name: string;
  message: string;
  code: number;
  status: number;
}

export const isDSGetScheduleErr = (val: unknown): val is DSGetScheduleErr =>
  isUnknownDict(val) && isStr(val.name) && isStr(val.message);

// Movie

const getMovideInfo = async (url: string): Promise<Partial<CinemaMovie>> => {
  const html = await getPageContent<string>({ url, cookies });
  const $ = cheerio.load(html);
  const title = $('.film__main-title').first().text();
  const description = $('.film__description').text();
  const poster = parseUrl($('.film__poster-image img').attr('src'));
  const trailer = parseTrailerUrl(parseUrl($('.film__to-trailer').attr('href')));
  const info = parseMovieInfoSection($, $('.film__info').first());
  return { title, description, poster, trailer, ...info };
};

const parseMovieInfoSection = ($: CheerioAPI, el: cheerio.Cheerio<Element>): Partial<CinemaMovie> => {
  const items = $('.film__info-group', el).toArray();
  if (!items.length) return {};
  const arr = items.map(itm => ({ name: $('dt', itm).text(), value: $('dd', itm).text() }));
  return movieInfoFieldsToObj(arr);
};

const movieInfoFieldsToObj = (arr: { name: string; value: string }[]): Partial<CinemaMovie> => {
  const obj: Partial<CinemaMovie> = {};
  const custom: Record<string, string> = {};
  for (const itm of arr) {
    const { name, value } = itm;
    if (!name) continue;
    const modName = name.toLocaleLowerCase();
    if (modName.indexOf('формат') !== -1) obj.format = parseStr(value);
    else if (modName.indexOf('рік') !== -1) obj.year = parseInt(value, 10);
    else if (modName.indexOf('мова') !== -1) obj.language = parseStr(value);
    else if (modName.indexOf('жанр') !== -1) obj.genre = parseCommaSepStr(parseStr(value), { toLower: true });
    else if (modName.indexOf('режисер') !== -1) obj.director = parseStr(value);
    else if (modName.indexOf(`дистриб'ютор`) !== -1) obj.distributor = parseStr(value);
    else if (modName.indexOf(`країна`) !== -1) obj.country = parseStr(value);
    else if (modName.indexOf(`тривалість`) !== -1) obj.duration = parseStr(value);
    else if (modName.indexOf(`вікові обмеження`) !== -1) obj.restrictions = parseStr(value);
    else if (modName.indexOf(`прокат`) !== -1) obj.start = parseStr(value);
    else if (modName.indexOf(`студія`) !== -1) obj.studio = parseStr(value);
    else custom[modName] = parseStr(value);
  }
  return Object.keys(custom).length ? { ...obj, custom } : obj;
};
