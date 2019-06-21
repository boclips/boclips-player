import { noop } from '../utils';
import { PlaybackEvent } from './AnalyticsEvents';

export interface AnalyticsOptions {
  metadata: { [key: string]: any };
  /**
   * @deprecated Callback signature will be replaced in a future version
   */
  handleOnPlayback: (event: PlaybackEvent) => void;
}

export const defaultOptions: AnalyticsOptions = Object.freeze({
  metadata: {},
  handleOnPlayback: noop,
});
