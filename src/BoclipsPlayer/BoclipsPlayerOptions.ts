import { BoclipsOptions } from '../BoclipsClient/BoclipsClient';
import { AnalyticsOptions } from '../Events/AnalyticsOptions';
import { WrapperOptions } from '../Wrapper/WrapperOptions';

export interface BoclipsPlayerOptions {
  analytics: Partial<AnalyticsOptions>;
  boclips: Partial<BoclipsOptions>;
  player: Partial<WrapperOptions>;
}

export const defaultOptions: BoclipsPlayerOptions = Object.freeze({
  analytics: {},
  boclips: {},
  player: {},
});
