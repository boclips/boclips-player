import axios from 'axios';
import { PrivatePlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { Logger } from '../Logger';
import { NullLogger } from '../NullLogger';
import {
  InteractionEventPayload,
  PlaybackEvent,
  PlayerInteractedWithEvent,
} from '../Events/AnalyticsEvents';
import { Video } from '../types/Video';
import convertVideoResource from '../utils/convertVideoResource';
import { BoclipsApiClient } from './BoclipsApiClient';
import { APIError } from '../ErrorHandler/InternalError';

export class AxiosBoclipsApiClient implements BoclipsApiClient {
  private readonly axios;

  public constructor(
    private readonly player: PrivatePlayer,
    private readonly logger: Logger = new NullLogger(),
  ) {
    this.axios = axios.create();
  }

  public retrieveVideo = async (uri: string): Promise<Video> => {
    const headers = await this.buildHeaders();

    return this.axios
      .get(uri, { headers, withCredentials: true })
      .then((response) => response.data)
      .then(convertVideoResource);
  };

  public emitPlaybackEvent = async (
    segmentStartSeconds: number,
    segmentEndSeconds: number,
    metadata: { [key: string]: any } = {},
  ): Promise<void> => {
    const headers = await this.buildHeaders();
    const video = this.player.getVideo();
    const logger = this.logger;

    if (!video) {
      return Promise.resolve();
    }

    const event: PlaybackEvent = {
      ...this.getCurrentMetadata(metadata),
      videoId: video.id,
      videoDurationSeconds: video.playback.duration,
      segmentStartSeconds,
      segmentEndSeconds,
    };

    return this.axios
      .post(video.playback.links.createPlaybackEvent.getOriginalLink(), event, {
        headers,
        withCredentials: true,
      })
      .catch((error) => {
        logger.error(error);
      });
  };

  public emitPlayerInteractionEvent = async <
    T extends keyof InteractionEventPayload,
  >(
    currentTime: number,
    type: T,
    payload: InteractionEventPayload[T],
  ): Promise<void> => {
    const headers = await this.buildHeaders();
    const video = this.player.getVideo();
    const logger = this.logger;

    if (!video) {
      return Promise.resolve();
    }

    const event: PlayerInteractedWithEvent<T> = {
      videoId: video.id,
      videoDurationSeconds: video.playback.duration,
      currentTime,
      subtype: type,
      payload,
    };

    return this.axios
      .post(
        video.playback.links.createPlayerInteractedWithEvent.getOriginalLink(),
        event,
        { headers },
      )
      .catch((error) => {
        logger.error(error);
      });
  };

  private getCurrentMetadata = (metadata: { [key: string]: any } = {}) =>
    Object.entries(metadata)
      .map(([key, value]) =>
        typeof value === 'function' ? [key, value()] : [key, value],
      )
      .reduce(
        (accumulator, [key, value]) => ({ ...accumulator, [key]: value }),
        {},
      );

  private buildHeaders = async () => {
    const logger = this.logger;
    const headers: {
      Authorization?: string;
      'Boclips-User-Id'?: string;
      'Boclips-Referer'?: string;
    } = {};

    if (this.getOptions().tokenFactory) {
      const token = await this.getOptions()
        .tokenFactory()
        .catch((error) => {
          logger.error(error);
          throw {
            type: 'API_ERROR',
            payload: { statusCode: 403 },
            fatal: true,
          } as APIError;
        });
      if (token !== null) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    if (this.getOptions().userIdFactory) {
      const userId = await this.getOptions()
        .userIdFactory()
        .catch((error) => {
          logger.error(error);
          throw {
            type: 'API_ERROR',
            payload: { statusCode: 400 },
            fatal: true,
          } as APIError;
        });
      if (userId !== null) {
        headers['Boclips-User-Id'] = userId;
      }
    }

    headers['Boclips-Referer'] = window.location.href;

    return headers;
  };

  private getOptions = () => this.player.getOptions().api;
}
