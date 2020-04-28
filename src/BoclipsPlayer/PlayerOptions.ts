import {
  ApiOptions,
  defaultApiOptions,
} from '../BoclipsApiClient/BoclipsApiClient';
import {
  AnalyticsOptions,
  defaultAnalyticsOptions,
} from '../Events/AnalyticsOptions';
import {
  defaultInterfaceOptions,
  InterfaceOptions,
} from '../MediaPlayer/InterfaceOptions';

export interface PlayerOptions {
  analytics: AnalyticsOptions;
  api: ApiOptions;
  debug: boolean;
  interface: InterfaceOptions;
  playerType: 'STREAM' | 'YOUTUBE';
}

export const defaultOptions: PlayerOptions = Object.freeze({
  analytics: defaultAnalyticsOptions,
  api: defaultApiOptions,
  debug: false,
  interface: defaultInterfaceOptions,
  playerType: 'STREAM',
});
