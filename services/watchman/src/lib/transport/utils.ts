import { TransportBus } from './types';
import { getObjectsDiff } from '@utils';

export const getBusesDiff = (prev: TransportBus[], next: TransportBus[]): Partial<TransportBus>[] => {
  const res: Partial<TransportBus>[] = [];
  for (const nextItm of next) {
    const prevItm = prev.find(itm => itm.tid === nextItm.tid);
    if (!prevItm) {
      res.push(nextItm);
      continue;
    }
    const diff = getObjectsDiff(prevItm, nextItm);
    if (Object.keys(diff).length) {
      res.push({ tid: nextItm.tid, ...diff });
    }
  }
  return res;
};

interface TransportBusesLocations {
  [key: string]: number[];
}

export const busesToLocations = (items: TransportBus[]): TransportBusesLocations => {
  const res: TransportBusesLocations = {};
  for (const item of items) {
    res[item.tid] = [item.lat, item.lng, item.direction, item.speed];
  }
  return res;
};
