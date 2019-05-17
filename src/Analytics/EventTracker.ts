import axios from 'axios';
import { parse, toSeconds } from 'iso8601-duration';
import { Link } from '../types/Link';
import { Video } from '../types/Video';

export interface EventTrackerInstance {
  configure: (video: Video) => void;
  handlePlay: (currentTime: number) => void;
  handlePause: (currentTime: number) => void;
  getSegmentPlaybackStartTime: () => number;
}

export class EventTracker implements EventTrackerInstance {
  private readonly playerId: string;
  private endpoints: { createPlaybackEvent?: Link } = {};
  private video: Video;
  private segmentPlaybackStartTime: number = -1;

  constructor(playerId: string) {
    this.playerId = playerId;
  }

  public configure = (video: Video) => {
    this.video = video;
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

    if (this.endpoints.createPlaybackEvent) {
      axios.post(this.endpoints.createPlaybackEvent.getOriginalLink(), {
        playerId: this.playerId,
        videoId: this.video.id,
        videoDurationSeconds: toSeconds(parse(this.video.playback.duration)),
        segmentStartSeconds: this.segmentPlaybackStartTime,
        segmentEndSeconds: currentTime,
      });
    }

    this.segmentPlaybackStartTime = -1;
  };

  public getSegmentPlaybackStartTime = () => this.segmentPlaybackStartTime;
}
