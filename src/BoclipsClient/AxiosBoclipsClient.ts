import axios from 'axios';
import { PlaybackEvent } from '../Events/AnalyticsEvents';
import { Video } from '../types/Video';
import convertVideoResource from '../utils/convertVideoResource';
import { BoclipsClient } from './BoclipsClient';

export class AxiosBoclipsClient implements BoclipsClient {
  // @ts-ignore
  public constructor(private tokenFactory?: () => string) {}

  public retrieveVideo = async (uri: string): Promise<Video> => {
    return await axios
      .get(uri, { headers: this.buildHeaders() })
      .then(response => response.data)
      .then(convertVideoResource);
  };

  public createPlaybackEvent = async (
    video: Video,
    event: PlaybackEvent,
  ): Promise<void> => {
    return await axios.post(
      video.playback.links.createPlaybackEvent.getOriginalLink(),
      event,
      { headers: this.buildHeaders() },
    );
  };

  private buildHeaders() {
    if (!this.tokenFactory) {
      return {};
    }

    return { Authorization: `Bearer: ${this.tokenFactory()}` };
  }
}
