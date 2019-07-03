import { PrivatePlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { Video } from '../types/Video';
import { InteractionEventPayload } from './AnalyticsEvents';

export interface AnalyticsInstance {
  configure: (video: Video) => void;
  handlePlay: (currentTime: number) => void;
  handlePause: (currentTime: number) => void;
  handleInteraction: <T extends keyof InteractionEventPayload>(
    currentTime: number,
    type: T,
    payload: InteractionEventPayload[T],
  ) => void;
  getSegmentPlaybackStartTime: () => number;
}

export class Analytics implements AnalyticsInstance {
  private video: Video;
  private segmentPlaybackStartTime: number = -1;

  constructor(private player: PrivatePlayer) {}

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

  public handleInteraction = <T extends keyof InteractionEventPayload>(
    currentTime: number,
    type: T,
    payload: InteractionEventPayload[T],
  ) => {
    // noinspection JSIgnoredPromiseFromCall
    this.player
      .getClient()
      .emitPlayerInteractionEvent(this.video, currentTime, type, payload);
  };

  private getOptions = () => this.player.getOptions().analytics;
}
