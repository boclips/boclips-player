import { MediaPlayerConstructor } from './MediaPlayer';

import PlyrWrapper from './Plyr/PlyrWrapper';

export class MediaPlayerFactory {
  public static get(): MediaPlayerConstructor {
    return PlyrWrapper;
  }
}
