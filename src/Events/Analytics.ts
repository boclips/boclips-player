import { PrivatePlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { InteractionEventPayload } from './AnalyticsEvents';

export interface AnalyticsInstance {
  handlePlay: (currentTime: number) => void;
  handlePause: (currentTime: number) => void;
  handleTimeUpdate: (currentTime: number) => void;
  handleInteraction: <T extends keyof InteractionEventPayload>(
    currentTime: number,
    type: T,
    payload: InteractionEventPayload[T],
  ) => void;
  getSegmentPlaybackStartTime: () => number;
}

export class Analytics implements AnalyticsInstance {
  private segmentPlaybackStartTime: number = -1;

  constructor(private player: PrivatePlayer) {}

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

  public handleTimeUpdate = (currentTime: number) =>
    this.handleTimeUpdate(currentTime);

  public getSegmentPlaybackStartTime = () => this.segmentPlaybackStartTime;

  private emitPlaybackEvent = (start: number, end: number) => {
    // noinspection JSIgnoredPromiseFromCall
    this.player
      .getClient()
      .emitPlaybackEvent(start, end, this.getOptions().metadata);

    this.getOptions().handleOnSegmentPlayback(
      this.player.getVideo(),
      start,
      end,
    );
  };

  public handleInteraction = <T extends keyof InteractionEventPayload>(
    currentTime: number,
    type: T,
    payload: InteractionEventPayload[T],
  ) => {
    // noinspection JSIgnoredPromiseFromCall
    this.player
      .getClient()
      .emitPlayerInteractionEvent(currentTime, type, payload);
  };

  private getOptions = () => this.player.getOptions().analytics;
}
