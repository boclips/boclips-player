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

  public retrieveVideo = async (uri: string): Promise<Video> =>
    this.buildHeaders().then(async headers => {
      return await this.axios
        .get(uri, { headers })
        .then(response => response.data)
        .then(convertVideoResource);
    });

  public createPlaybackEvent = async (
    video: Video,
    event: PlaybackEvent,
  ): Promise<void> =>
    this.buildHeaders().then(async headers => {
      return await this.axios.post(
        video.playback.links.createPlaybackEvent.getOriginalLink(),
        event,
        { headers },
      );
    });

  private buildHeaders = async () =>
    new Promise((resolve, reject) => {
      if (!this.options.tokenFactory) {
        resolve({});
      }

      this.options
        .tokenFactory()
        .then(token => {
          resolve({ Authorization: `Bearer ${token}` });
        })
        .catch(error => {
          const errorEvent: APIError = {
            type: 'API_ERROR',
            payload: { statusCode: 403 },
            fatal: true,
          };
          console.error(error);
          reject(errorEvent);
        });
    });
}
