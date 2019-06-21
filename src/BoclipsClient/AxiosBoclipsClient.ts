import axios from 'axios';
import deepmerge from 'deepmerge';
import { Player } from '..';
import { APIError } from '../ErrorHandler/ErrorHandler';
import { PlaybackEvent } from '../Events/AnalyticsEvents';
import { Video } from '../types/Video';
import convertVideoResource from '../utils/convertVideoResource';
import { BoclipsClient, defaultOptions } from './BoclipsClient';

export class AxiosBoclipsClient implements BoclipsClient {
  private readonly player: Player;
  private readonly axios;

  public constructor(player: Player) {
    this.player = player;
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
      playerId: this.player.getPlayerId(),
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

  private getOptions = () =>
    deepmerge(defaultOptions, this.player.getOptions().boclips);

  private buildHeaders = async () => {
    if (!this.getOptions().tokenFactory) {
      return {};
    }

    const token = await this.getOptions()
      .tokenFactory()
      .catch(error => {
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
