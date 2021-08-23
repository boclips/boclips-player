import { Addon, AddonInterface } from '../Addons';

const mockAddon = jest.fn(
  () =>
    ({
      canBeEnabled: jest.fn().mockReturnValue(true),
      destroy: jest.fn(),
      updateSegment: jest.fn(),
    } as AddonInterface),
) as any as Addon;

mockAddon.canBeEnabled = jest.fn().mockReturnValue(true);

// noinspection JSUnusedGlobalSymbols
export const Addons = [mockAddon];
