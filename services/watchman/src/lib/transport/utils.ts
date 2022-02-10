import { TransportBus } from '@core';
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
