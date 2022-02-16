/* eslint-disable max-len */
import { TransportBus, TransportType } from '@core';

import iconPinLeft1 from './assets/pinLeft1.svg.txt';
import iconPinLeft2 from './assets/pinLeft2.svg.txt';
import iconPinLeft3 from './assets/pinLeft3.svg.txt';
import iconPinLeft4 from './assets/pinLeft4.svg.txt';
import iconPinRight1 from './assets/pinRight1.svg.txt';
import iconPinRight2 from './assets/pinRight2.svg.txt';
import iconPinRight3 from './assets/pinRight3.svg.txt';
import iconPinRight4 from './assets/pinRight4.svg.txt';
import iconTrolleybusLeft from './assets/trolleybusLeft.svg.txt';
import iconTrolleybusRight from './assets/trolleybusRight.svg.txt';
import pinStation from './assets/pinStation.svg.txt';

export const getTransportIconCode = (busType: TransportType, direction: number, number: string, light: string, dark: string) => {
  const rotate = direction + 180;
  const type = direction <= 180 ? 'left' : 'right';
  const rotateStr = `rotate(${rotate} ${type === 'right' ? 23 : 23 + 12} 23)`;
  const label = clearRouteNumber(number || '');
  let code = '';
  if (label.length === 1) code = type === 'left' ? iconPinLeft1 : iconPinRight1;
  if (label.length === 2) code = type === 'left' ? iconPinLeft2 : iconPinRight2;
  if (label.length === 3) code = type === 'left' ? iconPinLeft3 : iconPinRight3;
  if (label.length === 4) code = type === 'left' ? iconPinLeft4 : iconPinRight4;
  if (busType === TransportType.Trolleybus) {
    const icon = type === 'left' ? iconTrolleybusLeft : iconTrolleybusRight;
    code = code.replace(/<path id="transport"[\s\S]+?\/>/g, icon);
  }
  code = code
    .replace(/#8E3339/g, dark)
    .replace(/#E0535D/g, light)
    .replace(/<tspan([\s\S]+?)>([\s\S]+?)<\/tspan>/g, `<tspan$1>${encodeLabelText(label)}</tspan>`)
    .replace(/<g id="pin">/g, `<g id="pin" transform="${rotateStr}">`);
  return code;
};

const encodeLabelText = (label: string) => unescape(encodeURIComponent(label));

const clearRouteNumber = (val: string): string =>
  val
    .replace(/[ТтTt-\s]/g, '')
    .trim()
    .toUpperCase();

export const getStationIcon = () => pinStation;
