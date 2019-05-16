import { Provider, Source } from '../Provider/Provider';

export const MockProvider = jest.fn<Provider, any>(
  (): Provider => {
    return {
      play: jest.fn(),
      source: (jest.fn<Source, any>() as any) as Source,
      pause: jest.fn(),
      installEventTracker: jest.fn(),
    };
  },
);
