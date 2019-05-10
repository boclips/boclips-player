import { Provider } from './Provider';

export const MockProvider = jest.fn<Provider, any>(
  (): Provider => {
    return {
      play: jest.fn(),
    };
  },
);
