import { AnalyticsOptions } from '../Events/AnalyticsOptions';
import { WrapperOptions } from '../Wrapper/WrapperOptions';
export interface BoclipsPlayerOptions {
    analytics: Partial<AnalyticsOptions>;
    player: Partial<WrapperOptions>;
}
export declare const defaultOptions: BoclipsPlayerOptions;
