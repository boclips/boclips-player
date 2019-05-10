import { PlayerLibrary } from './Player';

export class MockPlayerLibrary {
  public static mock(): PlayerLibrary {
    return {
      initialise: jest.fn(),
    };
  }
}
