import { Player } from '..';
import { Video } from '../types/Video';

export type WrapperConstructor = new (player: Player) => Wrapper;

export interface PlaybackSegment {
  /**
   * The number of seconds into the video that the segment starts
   */
  start?: number;
  /**
   * The number of seconds into the video that the segment ends
   */
  end?: number;
}

export interface Wrapper {
  play: () => Promise<void>;
  pause: () => void;
  configureWithVideo: (video: Video, segment?: PlaybackSegment) => void;
  destroy: () => void;
}
