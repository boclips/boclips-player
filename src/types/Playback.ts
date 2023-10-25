import { Link } from './Link';

interface PlaybackLinks {
  createPlayerInteractedWithEvent: Link;
  createPlaybackEvent: Link;
  thumbnail?: Link;
  videoPreview?: Link;
  hlsStream?: Link;
}

export type PlaybackType = StreamPlayback | YoutubePlayback;

export interface Playback {
  id: string;
  type: 'YOUTUBE' | 'STREAM';
  duration: number;
  links: PlaybackLinks;
  title?: string;
}

export type StreamPlayback = Playback;

export type YoutubePlayback = Playback;

export const isStreamPlayback = (
  playback: Playback,
): playback is StreamPlayback => playback && playback.type === 'STREAM';

export const isYoutubePlayback = (
  playback: Playback,
): playback is YoutubePlayback => playback && playback.type === 'YOUTUBE';
