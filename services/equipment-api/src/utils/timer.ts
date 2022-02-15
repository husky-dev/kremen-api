/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { errToStr } from '@utils';
import { EventEmitter } from 'events';

export class Timer extends EventEmitter {
  public stopped: boolean = true;
  public interval: number;
  public handler: TimerHandler;
  private timeoutHandler?: NodeJS.Timeout;

  constructor(interval: number, handler: TimerHandler) {
    super();
    this.handler = handler;
    this.interval = interval;
  }

  start() {
    this.emit('info', 'start');
    this.stopped = false;
    this.process();
    return this;
  }

  stop() {
    this.emit('info', 'stop');
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
      this.emit('debug', 'process start');
      await this.handler();
      this.emit('debug', 'process end');
      if (this.stopped) return;
      this.timeoutHandler = setTimeout(() => this.process(), this.interval);
    } catch (err: unknown) {
      this.emit('error', 'processing err', { msg: errToStr(err) });
    }
  }
}

type TimerHandler = () => Promise<unknown>;
