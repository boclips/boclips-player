import { PlaybackEvent } from '../Events/AnalyticsEvents';
import { Video } from '../types/Video';

export interface BoclipsOptions {
  tokenFactory?: () => Promise<string>;
}

export const defaultOptions: BoclipsOptions = Object.freeze({
  tokenFactory: null,
});

export interface BoclipsClient {
  retrieveVideo: (uri: string) => Promise<Video>;
  createPlaybackEvent: (video: Video, event: PlaybackEvent) => Promise<void>;
}
