export const noop: (args?: any) => any = () => {};


/* class decorator */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {constructor};
}