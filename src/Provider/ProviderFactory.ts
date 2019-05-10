import { ProviderConstructor } from './Provider';

import { default as PlyrProvider } from 'plyr';
import 'plyr/dist/plyr.css';

export class ProviderFactory {
  public static get(): ProviderConstructor {
    return PlyrProvider;
  }
}
