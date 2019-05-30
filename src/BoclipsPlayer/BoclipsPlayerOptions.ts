import { AnalyticsOptions } from '../Events/AnalyticsOptions';
import { WrapperOptions } from '../Wrapper/WrapperOptions';

export interface BoclipsPlayerOptions {
  analytics: Partial<AnalyticsOptions>;
  player: Partial<WrapperOptions>;
}

export const defaultOptions: BoclipsPlayerOptions = Object.freeze({
  analytics: {},
  player: {},
});
