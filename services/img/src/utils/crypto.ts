import { createHash } from 'crypto';

export const getStrHash = (val: string, size?: number) => {
  const hash = createHash('sha256').update(val, 'utf8').digest('hex');
  return !size ? hash : hash.slice(0, size);
};
