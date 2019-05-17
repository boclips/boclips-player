import { WrapperConstructor } from './Wrapper';

import PlyrWrapper from './Plyr/PlyrWrapper';

export class WrapperFactory {
  public static get(): WrapperConstructor {
    return PlyrWrapper;
  }
}
