import { config } from '@config';
import * as Sentry from '@sentry/node';
import { CaptureContext } from '@sentry/types';

type SentryMsgLevel = 'warning' | 'error' | 'info';

export const initSentry = () =>
  Sentry.init({
    dsn: config.sentry.dsn,
    tracesSampleRate: 1.0,
    environment: config.env,
    release: `${config.name}@${config.version}`,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
  });

export const captureSentryMsg = (msg: string, level: SentryMsgLevel, meta: unknown) => {
  const metaStr = meta ? `, ${JSON.stringify(meta)}` : '';
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  Sentry.captureMessage(`${msg}${metaStr}`, level as CaptureContext);
};
