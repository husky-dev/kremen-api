import { isArr, isStr, isUndef, isUnknownDict, isNull } from '@utils';

export interface EquipmentDataSourceCar {
  name: string;
  company: string;
  type: string;
  image: string;
  gps: string;
  comments: string;
}

export interface EquipmentDataSourceTimeEntryData {
  ts: number;
  lat: number;
  lng: number;
  accV?: number;
  satCount?: number;
  zajig?: number;
  acsel?: number;
  speed?: number;
}

export type EquipmentMachineType = 'tractor' | 'sweeper' | 'spreader' | 'garbage' | 'unknow';

export interface EquipmentMachine {
  eid: string;
  name: string;
  company: string;
  type: EquipmentMachineType;
  comments?: string;
  color: string;
  lat?: number;
  lng?: number;
  speed?: number;
  acsel?: number;
  ts?: number;
  log?: EquipmentDataSourceTimeEntryData[];
}

export const isEquipmentMachine = (val: unknown): val is EquipmentMachine =>
  isUnknownDict(val) && isStr(val.eid) && isStr(val.name);

export const isEquipmentMachineArr = (val: unknown): val is EquipmentMachine[] =>
  isArr(val) && val.reduce<boolean>((memo, itm) => isEquipmentMachine(itm), true);

export const isEquipmentMachineArrOrUndef = (val: unknown): val is EquipmentMachine[] | undefined =>
  isEquipmentMachineArr(val) || isUndef(val) || isNull(val);

export interface EquipmentLogQueryOpt {
  start: number;
  end: number;
  eid?: string;
}

export type EquipmentLogRecord = [string, number, number, number];

export type EquipmentMovementLogPeriod = 'day' | 'hour';
