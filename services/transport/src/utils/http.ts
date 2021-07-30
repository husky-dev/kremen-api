import { compact } from 'lodash';

export interface HttpQs {
  [key: string]: string | string[] | undefined;
}

export const parseIdsStr = (val: string): number[] =>
  compact(
    val.split(',').map(item => {
      const val = parseInt(item, 10);
      return isNaN(val) ? undefined : val;
    }),
  );
