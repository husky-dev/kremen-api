import { Log } from 'utils';
import mixpanel, { Dict } from 'mixpanel-browser';
import { genId } from 'utils';

import { getConf, setConf } from './configs';
import getUserLocale, { getUserLocales } from './locales';

const log = Log('core.analytics');

const enabled = APP_ENV !== 'dev';
// const enabled = true;

mixpanel.init('8133cb5ad59bba7d4dff11d715b39147');

// User

const getUID = (): string => {
  const storedUid = getConf<string>('uid');
  if (storedUid) {
    return storedUid;
  }
  const newUid = genId();
  setConf('uid', newUid);
  return newUid;
};

/**
 * Unique User ID
 */
export const uid = getUID();

const initUser = () => {
  if (!enabled) {
    return;
  }
  log.info('analytics enabled');
  mixpanel.identify();
  const locale = getUserLocale();
  const locales = getUserLocales();
  log.debug('locale=', locale, ', locales=', locales);
  mixpanel.people.set({
    version: APP_VERSION,
    env: APP_ENV,
    locale,
    locales,
  });
};

initUser();

/**
 * Track event
 * @param {MetricEvent} event - event name
 * @param {Dict?} params - event additional data
 */
export const track = (event: string, params?: Dict) => {
  if (!enabled) {
    return;
  }
  log.debug('track event=', event);
  mixpanel.track(event, params);
};
