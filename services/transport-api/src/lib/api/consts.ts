import { Log } from '@core';
import randomcolor from 'randomcolor';
const log = Log('lib.ds.consts');

export const routeColors: Record<string, string> = {
  '1': '#6B7A89',
  '10': '#4AB19D',
  '10A': '#2961DC',
  '11': '#475C7A',
  '117': '#A13B32',
  '12': '#B2C253',
  '13': '#C72C41',
  '15-б': '#E0535D',
  '15': '#3BB0D9',
  '16': '#449BB8',
  '17': '#DBBD49',
  '18': '#39B65C',
  '2-в': '#765D69',
  '2': '#2ABC9B',
  '216': '#7277D5',
  '28': '#7E8C8D',
  '3-а': '#8FB9A8',
  '3-б': '#D8434E',
  '30': '#D970AD',
  '4': '#F7BB43',
  '9': '#F2CC8C',
  'T11A+': '#9ED8EE',
  'T26A+': '#6B7A89',
  'T28A+': '#CB4942',
  'T5A+': '#D5AA00',
  'А 25': '#89A1E2',
  'Т 1': '#E0535D',
  'Т 1+': '#AB003A',
  'Т 2': '#449BB8',
  'Т 5': '#E67E23',
  'Т 6': '#A7B23C',
  'Т 7': '#C1D98B',
  Т15Б: '#7FC592',
  Т3Б: '#8E44AD',
  Т3Д: '#F0C40B',
};

export const routeNumberToColor = (routeNumber: string) => {
  const exColor = routeColors[routeNumber];
  if (!exColor) log.warn('no color found for route', { routeNumber });
  return exColor ? exColor : randomcolor({ seed: routeNumber });
};
