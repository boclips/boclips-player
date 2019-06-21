import { BoclipsOptions } from '../BoclipsClient/BoclipsClient';
import { AnalyticsOptions } from '../Events/AnalyticsOptions';
import { WrapperOptions } from '../Wrapper/WrapperOptions';

export interface PlayerOptions {
  analytics: Partial<AnalyticsOptions>;
  boclips: Partial<BoclipsOptions>;
  player: Partial<WrapperOptions>;
}

export const defaultOptions: PlayerOptions = Object.freeze({
  analytics: {},
  boclips: {},
  player: {},
});
