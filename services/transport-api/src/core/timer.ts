/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { errToStr } from '@utils';
import { Log } from './log';

const log = Log('core.timer');

export class Timer {
  public stopped: boolean = true;
  public interval: number;
  public handler: TimerHandler;
  private timeoutHandler?: NodeJS.Timeout;

  constructor(interval: number, handler: TimerHandler) {
    this.handler = handler;
    this.interval = interval;
  }

  start() {
    log.info('start');
    this.stopped = false;
    this.process();
    return this;
  }

  stop() {
    log.info('stop');
    this.stopped = true;
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = undefined;
    }
    return this;
  }

  private async process() {
    if (this.stopped) return;
    try {
      log.debug('process start');
      await this.handler();
      log.debug('process end');
      if (this.stopped) return;
      this.timeoutHandler = setTimeout(() => this.process(), this.interval);
    } catch (err: unknown) {
      log.err('processing err', { msg: errToStr(err) });
    }
  }
}

type TimerHandler = () => Promise<unknown>;
