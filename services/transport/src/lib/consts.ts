import randomcolor from 'randomcolor';

export const routeColors: Record<string, string> = {
  '1': '#6B7A89',
  '2': '#2ABC9B',
  '2-в': '#765D69',
  '3-а': '#8FB9A8',
  '3-б': '#D8434E',
  '4': '#F7BB43',
  '9': '#F2CC8C',
  '10': '#4AB19D',
  '11': '#475C7A',
  '12': '#B2C253',
  '13': '#C72C41',
  '15': '#3BB0D9',
  '15-б': '#E0535D',
  '16': '#449BB8',
  '17': '#DBBD49',
  '18': '#39B65C',
  '25': '#6B7A89',
  '28': '#7E8C8D',
  '30': '#D970AD',
  '216': '#7277D5',
  'Т 01': '#E0535D',
  'Т 1': '#E0535D',
  'Т 1+': '#AB003A',
  'Т 02': '#449BB8',
  'Т 2': '#449BB8',
  'Т 3-Б': '#8E44AD',
  Т3Б: '#8E44AD',
  'Т 3-Д': '#F0C40B',
  Т3Д: '#F0C40B',
  'Т 05': '#E67E23',
  T5: '#E67E23',
  'Т 5': '#E67E23',
  'Т 06': '#A7B23C',
  'Т 6': '#A7B23C',
  T26А: '#D5AA00',
  T28А: '#9ED8EE',
  'А 25': '#89A1E2',
};

export const routeNumberToColor = (routeNumber: string) => {
  const exColor = routeColors[routeNumber];
  return exColor ? exColor : randomcolor({ seed: routeNumber });
};
