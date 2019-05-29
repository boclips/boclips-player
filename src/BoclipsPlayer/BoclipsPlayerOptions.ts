import {
  AnalyticsOptions,
  defaultOptions as defaultAnalyticOptions,
} from '../Events/AnalyticsOptions';

export interface BoclipsPlayerOptions {
  analytics: Partial<AnalyticsOptions>;
}

export const defaultOptions: BoclipsPlayerOptions = Object.freeze({
  analytics: defaultAnalyticOptions,
});
