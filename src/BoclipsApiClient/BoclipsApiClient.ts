import { InteractionEventPayload } from '../Events/AnalyticsEvents';
import { Video } from '../types/Video';

export interface ApiOptions {
  /**
   * This callback should return a Promise which resolves a string to be used as the users authentication token.
   * For more information on generating a token see https://docs.boclips.com/docs/api-guide.html#overview-authentication
   *
   * If this callback rejects the promise for whatever reason, an error will be displayed to the user.
   */
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
  emitPlayerInteractionEvent: <T extends keyof InteractionEventPayload>(
    video: Video,
    currentTime: number,
    type: T,
    payload: InteractionEventPayload[T],
  ) => Promise<void>;
}
