import deepmerge from 'deepmerge';
import { Player } from '..';
import { Video } from '../types/Video';
import { defaultOptions } from './AnalyticsOptions';

export interface AnalyticsInstance {
  configure: (video: Video) => void;
  handlePlay: (currentTime: number) => void;
  handlePause: (currentTime: number) => void;
  getSegmentPlaybackStartTime: () => number;
}

export class Analytics implements AnalyticsInstance {
  private video: Video;
  private segmentPlaybackStartTime: number = -1;

  constructor(private player: Player) {}

  private getOptions = () =>
    deepmerge(defaultOptions, this.player.getOptions().analytics);

  public configure = (video: Video) => {
    this.video = video;
  };

  public handlePlay = (currentTime: number) => {
    this.segmentPlaybackStartTime = currentTime;
  };

  public handlePause = (currentTime: number) => {
    if (this.segmentPlaybackStartTime === -1) {
      return;
    }

    this.emitPlaybackEvent(this.segmentPlaybackStartTime, currentTime);

    this.segmentPlaybackStartTime = -1;
  };

  public getSegmentPlaybackStartTime = () => this.segmentPlaybackStartTime;

  private emitPlaybackEvent = (start: number, end: number) => {
    // noinspection JSIgnoredPromiseFromCall
    this.player
      .getClient()
      .emitPlaybackEvent(this.video, start, end, this.getOptions().metadata);

    this.getOptions().handleOnSegmentPlayback(this.video, start, end);
  };
}
