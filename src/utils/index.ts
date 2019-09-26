export const noop: (args?: any) => any = () => {};

export const withPx = (value: string | number) => `${value}px`;

export const getBoundedValue = (
  minimum: number,
  actual: number,
  maximum: number,
): number => Math.max(Math.min(maximum, actual), minimum);
