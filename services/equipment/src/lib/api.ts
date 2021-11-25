import { Log } from '@core';
import { EquipmentMachineType } from './types';
import { errToStr } from '@utils';
import axios from 'axios';
import { compact, maxBy } from 'lodash';
import md5 from 'md5';
import randomcolor from 'randomcolor';

import { DataSourceCar } from './types';
import { DataSourceEquipmentTimeEntryData, EquipmentMachine } from '@lib';

const log = Log('equipment.api');

const getEquipmentList = async () => {
  const cars = await api.getCars();
  const gspIds = cars.map(itm => itm.gps);
  const coords = await api.getCoordinates(gspIds);
  const equipment: EquipmentMachine[] = [];
  for (let i = 0; i < cars.length; i++) {
    const { gps, image, ...car } = cars[i];

    const eid = car.name ? md5(car.name).substr(0, 10) : 'empty';
    const color = randomcolor({ seed: eid });
    const machineType = getMachineTypeFromStr(car.type);
    const coordsLog = coords[i];
    const lastRecord = maxBy(coordsLog, 'ts');

    equipment.push({ eid, ...car, type: machineType, color, log: coordsLog || [], ...(lastRecord ? lastRecord : {}) });
  }
  return equipment;
};

const getCars = async (): Promise<DataSourceCar[]> => {
  const url = 'http://admin.logistika.org.ua:1999/getcars';
  try {
    const { data } = await axios({ url, method: 'GET' });
    return data;
  } catch (err: unknown) {
    throw new Error(`Datasource err: ${errToStr(err)}`);
  }
};

const getCoordinates = async (ids: string[]) => {
  const url = 'http://admin.logistika.org.ua:1999/getcoordcar';
  try {
    const { data } = await axios({ url, method: 'POST', data: ids.join('%') });
    return parseCoordinatesResp(data);
  } catch (err: unknown) {
    throw new Error(`Datasource err: ${errToStr(err)}`);
  }
};

const parseCoordinatesResp = (data: string) => {
  if (!data) return [];
  const items = data.split('%');
  return items.map(parseCoordinateLineResp);
};

const parseCoordinateLineResp = (data: string): DataSourceEquipmentTimeEntryData[] | undefined => {
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

const getMachineTypeFromStr = (rawVal: string): EquipmentMachineType => {
  if (!rawVal) {
    return 'unknow';
  }
  const val = rawVal.trim().toLocaleLowerCase();
  if (val === 'трактори') {
    return 'tractor';
  }
  if (val === 'снігоприбиральники') {
    return 'sweeper';
  }
  if (val === 'посипальники') {
    return 'spreader';
  }
  if (val === 'сміттєвози') {
    return 'garbageTruck';
  }
  log.warn('unknow machine type', { val: rawVal });
  return 'unknow';
};

export const api = { getCars, getCoordinates, getEquipmentList };
