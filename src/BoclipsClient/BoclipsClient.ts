import { PlaybackEvent } from '../Events/AnalyticsEvents';
import { Video } from '../types/Video';

export interface BoclipsClient {
  retrieveVideo: (uri: string) => Promise<Video>;
  createPlaybackEvent: (video: Video, event: PlaybackEvent) => Promise<void>;
}
