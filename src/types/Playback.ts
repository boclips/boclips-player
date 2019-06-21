import { Link } from './Link';

interface PlaybackLinks {
  createPlaybackEvent?: Link;
}

export type PlaybackType = StreamPlayback | YoutubePlayback;

export interface Playback {
  id: string;
  type: 'YOUTUBE' | 'STREAM';
  thumbnailUrl: string;
  duration: number;
  links: PlaybackLinks;
}

export interface StreamPlayback extends Playback {
  streamUrl: string;
}

export type YoutubePlayback = Playback;

export const isStreamPlayback = (
  playback: Playback,
): playback is StreamPlayback => playback.type === 'STREAM';

export const isYoutubePlayback = (
  playback: Playback,
): playback is StreamPlayback => playback.type === 'YOUTUBE';
