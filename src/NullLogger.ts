import { Logger } from './Logger';

export class NullLogger implements Logger {
  public error = () => {};
  public warn = () => {};
}
