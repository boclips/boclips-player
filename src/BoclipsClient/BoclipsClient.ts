import { Video } from '../types/Video';

export interface BoclipsOptions {
  tokenFactory?: () => Promise<string>;
}

export const defaultOptions: BoclipsOptions = Object.freeze({
  tokenFactory: null,
});

export interface BoclipsClient {
  retrieveVideo: (uri: string) => Promise<Video>;
  emitPlaybackEvent: (
    video: Video,
    segmentStartSeconds: number,
    segmentEndSeconds: number,
    metadata: { [key: string]: any },
  ) => Promise<void>;
}
