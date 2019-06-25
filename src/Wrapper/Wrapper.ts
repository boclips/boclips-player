import { Player } from '..';
import { Video } from '../types/Video';

export type WrapperConstructor = new (player: Player) => Wrapper;

export interface Wrapper {
  play: () => Promise<void>;
  pause: () => void;
  configureWithVideo: (video: Video) => void;
  destroy: () => void;
}
