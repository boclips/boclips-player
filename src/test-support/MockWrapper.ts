import { noop } from '../utils';
import { Wrapper } from '../Wrapper/Wrapper';

export const MockWrapper = jest.fn<Wrapper, any>(
  (): Wrapper => {
    return {
      configureWithVideo: jest.fn(),
      play: jest.fn().mockReturnValue(new Promise(noop)),
      pause: jest.fn(),
      destroy: jest.fn(),
    };
  },
);
