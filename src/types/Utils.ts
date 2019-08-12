/**
 * @see https://github.com/Microsoft/TypeScript/issues/30082#issuecomment-467028447
 */
export type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
