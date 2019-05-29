import { noop } from '../utils';
import { PlaybackEvent } from './AnalyticsEvents';

export interface AnalyticsOptions {
  metadata: { [key: string]: string };
  handleOnPlayback: (event: PlaybackEvent) => void;
}

export const defaultOptions: AnalyticsOptions = Object.freeze({
  metadata: {},
  handleOnPlayback: noop,
});
