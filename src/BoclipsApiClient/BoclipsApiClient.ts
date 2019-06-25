import { Video } from '../types/Video';

export interface ApiOptions {
  tokenFactory?: () => Promise<string>;
}

export const defaultApiOptions: ApiOptions = Object.freeze({
  tokenFactory: null,
});

export interface BoclipsApiClient {
  retrieveVideo: (uri: string) => Promise<Video>;
  emitPlaybackEvent: (
    video: Video,
    segmentStartSeconds: number,
    segmentEndSeconds: number,
    metadata: { [key: string]: any },
  ) => Promise<void>;
}
