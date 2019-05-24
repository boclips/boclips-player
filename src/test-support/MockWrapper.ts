import { Wrapper } from '../Wrapper/Wrapper';

export const MockWrapper = jest.fn<Wrapper, any>(
  (): Wrapper => {
    return {
      configureWithVideo: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      destroy: jest.fn(),
    };
  },
);
