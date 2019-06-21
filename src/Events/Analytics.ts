import deepmerge from 'deepmerge';
import { BoclipsClient } from '../BoclipsClient/BoclipsClient';
import { Video } from '../types/Video';
import { AnalyticsOptions, defaultOptions } from './AnalyticsOptions';

export interface AnalyticsInstance {
  configure: (video: Video) => void;
  handlePlay: (currentTime: number) => void;
  handlePause: (currentTime: number) => void;
  getSegmentPlaybackStartTime: () => number;
}

export class Analytics implements AnalyticsInstance {
  private readonly boclipsClient: BoclipsClient;
  private video: Video;
  private segmentPlaybackStartTime: number = -1;
  private options: AnalyticsOptions;

  constructor(
    boclipsClient: BoclipsClient,
    options: Partial<AnalyticsOptions> = {},
  ) {
    this.boclipsClient = boclipsClient;
    this.options = deepmerge(defaultOptions, options);
  }

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
    this.boclipsClient.emitPlaybackEvent(
      this.video,
      start,
      end,
      this.options.metadata,
    );

    this.options.handleOnSegmentPlayback(this.video, start, end);
  };
}
