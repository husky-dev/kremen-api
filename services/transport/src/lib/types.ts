// Basic

export enum TransportCountry {
  KZ = 1,
  RU = 2,
  UA = 3,
}

export enum TransportCity {
  Kremenchuk = 10,
}

export enum TransportType {
  Bus = 'B',
  Trolleybus = 'T',
}

export interface TransportStation {
  sid: number;
  rid: number;
  lat: number;
  lng: number;
  name: string;
  sequenceNumber: number;
  directionForward: boolean;
}

export interface TransportRoute {
  rid: number;
  path: number[][];
  active: number;
  type: TransportType;
  name: string;
  number: string;
  stations: TransportStation[];
  color?: string;
}

export interface TransportBus {
  tid: string;
  rid: number;
  type: TransportType;
  direction: number;
  invalidAdapted: boolean;
  lat: number;
  lng: number;
  name: string;
  offline: boolean;
  speed: number;
}

export interface TransportPrediction {
  rid: number;
  sid: number;
  tid: string;
  reverse: boolean;
  distance: number;
  prediction: number;
  generatedTime: number;
  messageTime: number;
  avgSpeed: number;
  speed: number;
  mainPrediction: boolean;
}

// Data Source

export interface TransportDataSourceRoute {
  cityId: number;
  location: string;
  busreportRouteId: number;
  bussesOnRoute: number;
  routeName: string;
  routeNumber: string;
}

export interface TransportDataSourceBus {
  busreportRouteId: number;
  cityId: number;
  direction: number;
  imei: string;
  invalidAdapted: boolean;
  lat: number;
  lon: number;
  name: string;
  offline: boolean;
  speed: number;
}

export interface TransportDataSourceStation {
  id: number;
  routeId: number;
  lat: number;
  lon: number;
  name: string;
  sequenceNumber: number;
  directionForward: boolean;
}

export interface TransportDataSourcePrediction {
  routeId: number;
  stationId: number;
  busIMEI: string;
  reverse: boolean;
  distance: number;
  prediction: number;
  generatedTime: number;
  messageTime: number;
  avgSpeed: number;
  speed: number;
  mainPrediction: boolean;
}

export interface TransportBusesLocations {
  [key: string]: number[];
}
