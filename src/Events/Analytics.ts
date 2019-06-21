import deepmerge from 'deepmerge';
import { parse, toSeconds } from 'iso8601-duration';
import { BoclipsClient } from '../BoclipsClient/BoclipsClient';
import { Video } from '../types/Video';
import { PlaybackEvent } from './AnalyticsEvents';
import { AnalyticsOptions, defaultOptions } from './AnalyticsOptions';

export interface AnalyticsInstance {
  configure: (video: Video) => void;
  handlePlay: (currentTime: number) => void;
  handlePause: (currentTime: number) => void;
  getSegmentPlaybackStartTime: () => number;
}

export class Analytics implements AnalyticsInstance {
  private readonly boclipsClient: BoclipsClient;
  private readonly playerId: string;
  private video: Video;
  private segmentPlaybackStartTime: number = -1;
  private options: AnalyticsOptions;

  constructor(
    boclipsClient: BoclipsClient,
    playerId: string,
    options: Partial<AnalyticsOptions> = {},
  ) {
    this.boclipsClient = boclipsClient;
    this.options = deepmerge(defaultOptions, options);
    this.playerId = playerId;
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
    const event: PlaybackEvent = {
      ...this.options.metadata,
      playerId: this.playerId,
      captureTime: new Date(),
      videoId: this.video.id,
      videoDurationSeconds: toSeconds(parse(this.video.playback.duration)),
      segmentStartSeconds: start,
      segmentEndSeconds: end,
    };

    // noinspection JSIgnoredPromiseFromCall
    this.boclipsClient.createPlaybackEvent(this.video, event);

    this.options.handleOnPlayback(event);
  };
}
