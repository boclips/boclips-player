import { Player } from '..';
import { Video } from '../types/Video';

export type MediaPlayerConstructor = new (player: Player) => MediaPlayer;

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

export interface MediaPlayer {
  play: () => Promise<void>;
  pause: () => void;
  configureWithVideo: (video: Video, segment?: PlaybackSegment) => void;
  destroy: () => void;
  getVideoContainer: () => HTMLVideoElement | HTMLIFrameElement;
  getCurrentTime: () => number;
  onEnd: (callback: (overlayClassName: string) => void) => void;
}
