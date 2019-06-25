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
} from '../Wrapper/InterfaceOptions';

export interface PlayerOptions {
  analytics: Partial<AnalyticsOptions>;
  api: Partial<ApiOptions>;
  interface: Partial<InterfaceOptions>;
}

export const defaultOptions: PlayerOptions = Object.freeze({
  analytics: defaultAnalyticsOptions,
  api: defaultApiOptions,
  interface: defaultInterfaceOptions,
});
