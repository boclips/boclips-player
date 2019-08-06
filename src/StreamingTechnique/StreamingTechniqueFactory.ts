import { PrivatePlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { HlsWrapper } from './HlsWrapper/HlsWrapper';
import { StreamingTechnique } from './StreamingTechnique';

export class StreamingTechniqueFactory {
  public static get(player: PrivatePlayer): StreamingTechnique | null {
    if (HlsWrapper.isSupported()) {
      return new HlsWrapper(player);
    }

    return null;
  }
}
