export interface Logger {
  error: (...args: any) => void;
  warn: (...args: any) => void;
}
