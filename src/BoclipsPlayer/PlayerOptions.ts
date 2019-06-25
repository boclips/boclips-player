import {
  ApiOptions,
  defaultApiOptions,
} from '../BoclipsApiClient/BoclipsApiClient';
import {
  AnalyticsOptions,
  defaultAnalyticsOptions,
} from '../Events/AnalyticsOptions';
import {
  defaultWrapperOptions,
  WrapperOptions,
} from '../Wrapper/WrapperOptions';

export interface PlayerOptions {
  analytics: Partial<AnalyticsOptions>;
  api: Partial<ApiOptions>;
  player: Partial<WrapperOptions>;
}

export const defaultOptions: PlayerOptions = Object.freeze({
  analytics: defaultAnalyticsOptions,
  api: defaultApiOptions,
  player: defaultWrapperOptions,
});
