import axios from 'axios';
import { Link } from '../types/Link';
import { Video } from '../types/Video';

export class EventTracker {
  private readonly playerId: string;
  private endpoints: { createPlaybackEvent?: Link } = {};
  private videoId: string;
  private segmentPlaybackStartTime: number = -1;

  constructor(playerId: string) {
    this.playerId = playerId;
  }

  public configure = (video: Video) => {
    this.videoId = video.id;
    this.endpoints = {
      createPlaybackEvent: video.playback.links.createPlaybackEvent,
    };
  };

  public handlePlay = (currentTime: number) => {
    this.segmentPlaybackStartTime = currentTime;
  };

  public handlePause = (currentTime: number) => {
    if (this.segmentPlaybackStartTime === -1) {
      return;
    }

    axios.post(this.endpoints.createPlaybackEvent.getOriginalLink(), {
      playerId: this.playerId,
      videoId: this.videoId,
      segmentStartSeconds: this.segmentPlaybackStartTime,
      segmentEndSeconds: currentTime,
    });

    this.segmentPlaybackStartTime = -1;
  };

  public getSegmentPlaybackStartTime = () => this.segmentPlaybackStartTime;
}
