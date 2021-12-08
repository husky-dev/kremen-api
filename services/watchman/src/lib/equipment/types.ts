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
