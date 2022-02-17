/* eslint-disable max-len */
import { getStrHash } from '@utils';

import iconPinLeft1 from './assets/pinLeft1.svg.txt';
import iconPinLeft2 from './assets/pinLeft2.svg.txt';
import iconPinLeft3 from './assets/pinLeft3.svg.txt';
import iconPinLeft4 from './assets/pinLeft4.svg.txt';
import iconPinRight1 from './assets/pinRight1.svg.txt';
import iconPinRight2 from './assets/pinRight2.svg.txt';
import iconPinRight3 from './assets/pinRight3.svg.txt';
import iconPinRight4 from './assets/pinRight4.svg.txt';
import pinStation from './assets/pinStation.svg.txt';
import iconTrolleybusLeft from './assets/trolleybusLeft.svg.txt';
import iconTrolleybusRight from './assets/trolleybusRight.svg.txt';
import { TransportBusPinIcon, TransportStationPinIcon } from './types';

export const getTransportBusPinIconCode = (icon: TransportBusPinIcon) => {
  const { direction, number, type: busType, light, dark } = icon;
  const rotate = direction + 180;
  const type = direction <= 180 ? 'left' : 'right';
  const rotateStr = `rotate(${rotate} ${type === 'right' ? 23 : 23 + 12} 23)`;
  const label = clearRouteNumber(number);
  let code = '';
  if (label.length === 1) code = type === 'left' ? iconPinLeft1 : iconPinRight1;
  if (label.length === 2) code = type === 'left' ? iconPinLeft2 : iconPinRight2;
  if (label.length === 3) code = type === 'left' ? iconPinLeft3 : iconPinRight3;
  if (label.length === 4) code = type === 'left' ? iconPinLeft4 : iconPinRight4;
  if (busType === 'trolleybus') {
    const icon = type === 'left' ? iconTrolleybusLeft : iconTrolleybusRight;
    code = code.replace(/<path id="transport"[\s\S]+?\/>/g, icon);
  }
  return code
    .replace(/#8E3339/g, dark)
    .replace(/#E0535D/g, light)
    .replace(/<tspan([\s\S]+?)>([\s\S]+?)<\/tspan>/g, `<tspan$1>${label}</tspan>`)
    .replace(/<g id="pin">/g, `<g id="pin" transform="${rotateStr}">`);
};

export const getTransportBusIconFileName = (icon: TransportBusPinIcon) => {
  const { light, dark, type, density, number, direction, version, theme } = icon;
  const parts: string[] = [
    'tr-bs-pin',
    `d${density}`,
    `t${clearPart(type)}`,
    `cl${clearPart(light)}`,
    `cd${clearPart(dark)}`,
    `n${clearPart(number)}`,
    `dr${direction}`,
    theme,
    `${version}`,
  ];
  return `${getStrHash(parts.join(), 10)}.png`;
};

const clearRouteNumber = (val: string): string =>
  val
    .replace(/[ТтTt-\s]/g, '')
    .trim()
    .toUpperCase();

export const getStationIcon = ({ theme }: TransportStationPinIcon) =>
  theme === 'light' ? pinStation : pinStation.replace('stroke="#2A569E"', 'stroke="#FFFFFF"');

export const getTransportStationIconFileName = (icon: TransportStationPinIcon) => {
  const { density, version, theme } = icon;
  return `tr-st-pin-d${density}-${theme}-${version}.png`;
};

const clearPart = (val: string) => val.toLowerCase().replace(/[^\w\dА-я]/g, '');
