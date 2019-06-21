import axios from 'axios';
import deepmerge from 'deepmerge';
import { APIError } from '../ErrorHandler/ErrorHandler';
import { PlaybackEvent } from '../Events/AnalyticsEvents';
import { Video } from '../types/Video';
import convertVideoResource from '../utils/convertVideoResource';
import { BoclipsClient, BoclipsOptions, defaultOptions } from './BoclipsClient';

export class AxiosBoclipsClient implements BoclipsClient {
  private readonly options;
  private readonly axios;

  public constructor(options: Partial<BoclipsOptions> = {}) {
    this.options = deepmerge(defaultOptions, options);

    this.axios = axios.create();
  }

  public retrieveVideo = async (uri: string): Promise<Video> => {
    const headers = await this.buildHeaders();

    return this.axios
      .get(uri, { headers })
      .then(response => response.data)
      .then(convertVideoResource);
  };

  public emitPlaybackEvent = async (
    video: Video,
    segmentStartSeconds: number,
    segmentEndSeconds: number,
    metadata: { [key: string]: any } = {},
  ): Promise<void> => {
    const headers = await this.buildHeaders();

    const event: PlaybackEvent = {
      ...metadata,
      // playerId: this.playerId,
      captureTime: new Date(),
      videoId: video.id,
      videoDurationSeconds: video.playback.duration,
      segmentStartSeconds,
      segmentEndSeconds,
    };

    return this.axios
      .post(video.playback.links.createPlaybackEvent.getOriginalLink(), event, {
        headers,
      })
      .catch(error => {
        console.error(error);
      });
  };

  private buildHeaders = async () => {
    if (!this.options.tokenFactory) {
      return {};
    }

    const token = await this.options.tokenFactory().catch(error => {
      console.error(error);
      throw {
        type: 'API_ERROR',
        payload: { statusCode: 403 },
        fatal: true,
      } as APIError;
    });

    return { Authorization: `Bearer ${token}` };
  };
}
