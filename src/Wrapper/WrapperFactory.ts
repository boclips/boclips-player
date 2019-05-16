import { WrapperConstructor } from './Wrapper';

import PlyrWrapper from './PlyrWrapper';

export class WrapperFactory {
  public static get(): WrapperConstructor {
    return PlyrWrapper;
  }
}
