import { EquipmentDataSourceCar, EquipmentDataSourceTimeEntryData, EquipmentMachine, EquipmentMachineType, Log } from '@core';
import { compact, errToStr, wait } from '@utils';
import axios, { AxiosRequestConfig } from 'axios';
import { maxBy } from 'lodash';
import md5 from 'md5';
import randomcolor from 'randomcolor';

const log = Log('lib');

export class DatasourceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const getEquipmentList = async () => {
  const cars = await api.getCars();
  const gspIds = cars.map(itm => itm.gps);
  const coords = await api.getCoordinates(gspIds);
  const equipment: EquipmentMachine[] = [];
  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const coordsLog = coords[i];
    const lastRecord = maxBy(coordsLog, 'ts');

    const machine: EquipmentMachine = {
      eid: car.name ? md5(car.name).substr(0, 10) : 'empty',
      name: car.name,
      company: car.company,
      comments: car.comments ? car.comments : undefined,
      color: machineCompanyNameToColor(car.company),
      type: machineNameToType(car.type),
      log: coordsLog,
    };
    if (lastRecord) {
      machine.lat = lastRecord.lat;
      machine.lng = lastRecord.lng;
      machine.speed = lastRecord.speed;
      machine.ts = lastRecord.ts;
      machine.acsel = lastRecord.acsel;
    }
    equipment.push(machine);
  }
  return equipment;
};

interface ApiReqOpt {
  path: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  retry?: number;
}

const maxRetryCount = 3;

const apiReq = async <D>({ path, method = 'get', data, retry = 0 }: ApiReqOpt): Promise<D> => {
  const url = `http://admin.logistika.org.ua:1999/${path}`;
  try {
    log.debug('api req', { method, url, data });
    const { data: body } = await axios({ url, method, data });
    log.debug('api req done');
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return body as D;
  } catch (err: unknown) {
    if (retry >= maxRetryCount) throw new DatasourceError(`${errToStr(err)}`);
    const waitMs = 2 ** retry * 100;
    log.debug('api req err, retry', { method, path, data, retry, waitMs });
    await wait(waitMs);
    return apiReq({ path, method, data, retry: retry + 1 });
  }
};

const getCars = async (): Promise<EquipmentDataSourceCar[]> => apiReq({ path: 'getcars' });

const getCoordinates = async (ids: string[]) => {
  const data = await apiReq<string>({ method: 'post', path: 'getcoordcar', data: ids.join('%') });
  return parseCoordinatesResp(data);
};

// const getCoordinates = async (ids: string[]) => {
//   const url = 'http://admin.logistika.org.ua:1999/getcoordcar';
//   try {
//     const { data } = await axios({ url, method: 'POST', data: ids.join('%') });
//     return parseCoordinatesResp(data);
//   } catch (err: unknown) {
//     throw new Error(`Datasource err: ${errToStr(err)}`);
//   }
// };

const parseCoordinatesResp = (data: string) => {
  if (!data) return [];
  const items = data.split('%');
  return items.map(parseCoordinateLineResp);
};

const parseCoordinateLineResp = (data: string): EquipmentDataSourceTimeEntryData[] | undefined => {
  if (!data) return undefined;
  const parts = data.split('|');
  if (!parts.length) {
    log.err('parsing coordinates line error', { data });
    return undefined;
  }

  const dateStr = parts[0];
  if (!/^\d+\.\d+\.\d+$/g.test(dateStr)) {
    log.err('parsing coordinates date error', { data });
    return undefined;
  }
  const day = parseInt(dateStr.slice(0, 2), 10);
  const month = parseInt(dateStr.slice(3, 5), 10) - 1;
  const year = parseInt(dateStr.slice(6, 10), 10);

  const rawEntries = compact(parts.slice(1).map(parseCoordinatesEntry));
  const entries = rawEntries.map(itm => {
    const { hours, minutes, seconds, ...fields } = itm;
    const ts = new Date(year, month, day, hours, minutes, seconds).getTime();
    return { ts, ...fields };
  });

  return entries;
};

interface DataSourceEquipmentRawTimeEntryData {
  hours: number;
  minutes: number;
  seconds: number;
  lat: number;
  lng: number;
  accV?: number;
  satCount?: number;
  zajig?: number;
  acsel?: number;
  speed?: number;
}

const parseCoordinatesEntry = (str: string): DataSourceEquipmentRawTimeEntryData | undefined => {
  if (!str) return undefined;
  const parts = str.split(';');
  if (parts.length < 3) {
    log.err('parsing coordinates entry error', { str });
    return undefined;
  }
  const [timeStr, latStr, lngStr] = parts;

  if (!/\d{6}/g.test(timeStr)) {
    log.err('parsing coordinates entry time error', { str });
    return undefined;
  }
  const hours = parseInt(timeStr.slice(0, 2), 10);
  const minutes = parseInt(timeStr.slice(2, 4), 10);
  const seconds = parseInt(timeStr.slice(4, 6), 10);

  const lat = parseFloat(latStr);
  if (isNaN(lat)) {
    log.err('parsing coordinates entry latitude error', { str });
    return undefined;
  }

  const lng = parseFloat(lngStr);
  if (isNaN(lng)) {
    log.err('parsing coordinates entry longitude error', { str });
    return undefined;
  }

  const data: DataSourceEquipmentRawTimeEntryData = {
    hours,
    minutes,
    seconds,
    lat,
    lng,
  };

  for (let i = 3; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (part.indexOf('AccV=') === 0) {
      data.accV = parseFloat(part.slice(5));
    }
    if (part.indexOf('SatCount=') === 0) {
      data.satCount = parseInt(part.slice(9), 10);
    }
    if (part.indexOf('Zajig=') === 0) {
      data.zajig = parseFloat(part.slice(6));
    }
    if (part.indexOf('Acsel=') === 0) {
      data.acsel = parseFloat(part.slice(6));
    }
    if (part.indexOf('Speed=') === 0) {
      data.speed = parseFloat(part.slice(6));
    }
  }

  return data;
};

const machineNameToType = (rawVal: string): EquipmentMachineType => {
  if (!rawVal) {
    return 'unknow';
  }
  const val = rawVal.trim().toLocaleLowerCase();
  switch (val) {
    case 'трактори':
      return 'tractor';
    case 'снігоприбиральники':
      return 'sweeper';
    case 'посипальники':
      return 'spreader';
    case 'сміттєвози':
      return 'garbage';
  }
  log.warn('unknow machine type', { val: rawVal });
  return 'unknow';
};

const machineCompanyNameToColor = (company: string) => {
  const colormap: Record<string, string> = {
    'Кременчуцьке КАТП 1628': '#4AB19D',
    'КПС ШРБУ': '#E0535D',
    Теплоенерго: '#F7BB43',
    'Благоустрій Кременчука': '#7277D5',
    КРЕМЕНЧУКВОДОКАНАЛ: '#2961DC',
  };
  const color = colormap[company];
  if (!color) log.warn('no color found for company', { company });
  return color ? color : randomcolor({ seed: company });
};

export const api = { getCars, getCoordinates, getEquipmentList };
