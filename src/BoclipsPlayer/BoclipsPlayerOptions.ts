import { AnalyticsOptions } from '../Events/AnalyticsOptions';
import { WrapperOptions } from '../Wrapper/WrapperOptions';

// tag::doc[]
export interface BoclipsPlayerOptions {
  analytics: Partial<AnalyticsOptions>;
  player: Partial<WrapperOptions>;
}
// end::doc[]

export const defaultOptions: BoclipsPlayerOptions = Object.freeze({
  analytics: {},
  player: {},
});
