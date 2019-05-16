import { Source, Wrapper } from '../Wrapper/Wrapper';

export const MockWrapper = jest.fn<Wrapper, any>(
  (): Wrapper => {
    return {
      play: jest.fn(),
      source: (jest.fn<Source, any>() as any) as Source,
      pause: jest.fn(),
      installEventTracker: jest.fn(),
    };
  },
);
