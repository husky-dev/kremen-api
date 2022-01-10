import { EquipmentMachine } from '@core/api';
import { getObjectsDiff } from '@utils';

export const getEquipmentMachineDiff = (
  prev: EquipmentMachine[],
  next: EquipmentMachine[],
): Partial<EquipmentMachine>[] => {
  const res: Partial<EquipmentMachine>[] = [];
  for (const nextItm of next) {
    const prevItm = prev.find(itm => itm.eid === nextItm.eid);
    if (!prevItm) {
      res.push(nextItm);
      continue;
    }
    const diff = getObjectsDiff(prevItm, nextItm);
    if (Object.keys(diff).length) {
      res.push({ eid: nextItm.eid, ...diff });
    }
  }
  return res;
};
