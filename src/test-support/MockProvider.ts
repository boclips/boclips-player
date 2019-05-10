import { Provider } from '../Provider/Provider';

export const MockProvider = jest.fn<Provider, any>(
  (): Provider => {
    return {
      play: jest.fn(),
    };
  },
);
