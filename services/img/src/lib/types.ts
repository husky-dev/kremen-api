import Joi from 'joi';

type TransportIconTheme = 'light' | 'dark';

// Bus

export interface TransportBusPinQuery {
  v?: number;
  d?: number;
  light?: string;
  dark?: string;
  direction?: number;
  number: string;
  type?: TransportBusPinType;
  theme?: TransportIconTheme;
  pin?: TransportPinType;
}

type TransportBusPinType = 'bus' | 'trolleybus' | 'B' | 'T';

type TransportPinType = 'with-label' | 'circle';

export const TransportBusPinQuerySchema = Joi.object<TransportBusPinQuery>({
  v: Joi.number().min(0).max(10),
  d: Joi.number().min(1).max(5),
  light: Joi.string(),
  dark: Joi.string(),
  direction: Joi.number().min(0).max(360),
  number: Joi.string().max(5).required(),
  type: Joi.string().valid('bus', 'trolleybus', 'B', 'T'),
  theme: Joi.string().valid('light', 'dark'),
  pin: Joi.string().valid('with-label', 'circle'),
});

export interface TransportBusPinIcon {
  version: number;
  density: number;
  light: string;
  dark: string;
  direction: number;
  number: string;
  type: TransportBusPinType;
  theme: TransportIconTheme;
  pin: TransportPinType;
}

// Station

export interface TransportStationPinQuery {
  v?: number;
  d?: number;
  theme?: TransportIconTheme;
}

export const TransportStationPinQuerySchema = Joi.object<TransportStationPinQuery>({
  v: Joi.number().min(0).max(10),
  d: Joi.number().min(1).max(5),
  theme: Joi.string().valid('light', 'dark'),
});

export interface TransportStationPinIcon {
  version: number;
  density: number;
  theme: TransportIconTheme;
}
