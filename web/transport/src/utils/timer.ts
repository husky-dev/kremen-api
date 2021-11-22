/* eslint-disable @typescript-eslint/no-explicit-any */
export type TimerHandler = () => Promise<any>;

export class Timer {
  private handler: TimerHandler;
  private running: boolean = false;
  private interval: number;
  private timeout: number | null = null;

  constructor(handler: TimerHandler, interval: number, immediate?: boolean) {
    this.handler = handler;
    this.interval = interval;
    if (immediate) {
      this.start(true);
    }
  }

  public start(immediate: boolean = true) {
    this.running = true;
    if (immediate) {
      this.process();
    } else {
      this.startTimer();
    }
  }

  public stop() {
    this.running = false;
    this.resetTimer();
  }

  private startTimer() {
    if (!this.running) {
      return false;
    }
    this.resetTimer();
    setTimeout(() => this.process(), this.interval);
  }

  private resetTimer() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = null;
  }

  private process() {
    this.handler()
      .then(() => {
        this.startTimer();
      })
      .catch(() => {
        this.startTimer();
      });
  }
}
