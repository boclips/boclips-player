import { Logger } from './Logger';

export class ConsoleLogger implements Logger {
  public error = (...args: any) => {
    console.error(args);
  };

  public warn = (...args: any) => {
    console.warn(args);
  };
}
