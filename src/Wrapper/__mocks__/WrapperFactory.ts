import { Wrapper } from '../Wrapper';
import { noop } from '../../utils';

export const MockWrapper = jest.fn<Wrapper, any>().mockImplementation(
  (): Wrapper => {
    return {
      configureWithVideo: jest.fn(),
      play: jest.fn().mockReturnValue(new Promise(noop)),
      pause: jest.fn(),
      destroy: jest.fn(),
    };
  },
);

// noinspection JSUnusedGlobalSymbols
export const WrapperFactory = {
  get: jest.fn().mockReturnValue(MockWrapper),
};
