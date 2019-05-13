import { ProviderConstructor } from './Provider';

import PlyrWrapper from './PlyrWrapper';

export class ProviderFactory {
  public static get(): ProviderConstructor {
    return PlyrWrapper;
  }
}
