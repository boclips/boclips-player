import { noop } from '../utils';
import { PlaybackEvent } from './AnalyticsEvents';

// tag::doc[]
export interface AnalyticsOptions {
  metadata: { [key: string]: any };
  handleOnPlayback: (event: PlaybackEvent) => void;
}
// end::doc[]

export const defaultOptions: AnalyticsOptions = Object.freeze({
  metadata: {},
  handleOnPlayback: noop,
});
