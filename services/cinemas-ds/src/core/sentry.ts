import { config } from '@config';
import * as Sentry from '@sentry/node';
import { Severity } from '@sentry/node';

export const initSentry = () =>
  Sentry.init({
    dsn: config.sentry.dsn,
    tracesSampleRate: 1.0,
    environment: config.env,
    release: `${config.name}@${config.version}`,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
    beforeSend: event => (config.env === 'prd' ? event : null),
  });

export const captureSentryMsg = (msg: string, level: Severity, meta: unknown) => {
  const metaStr = meta ? `, ${JSON.stringify(meta)}` : '';
  Sentry.captureMessage(`${msg}${metaStr}`, level);
};

export { Severity } from '@sentry/node';
