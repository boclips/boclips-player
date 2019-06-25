import {
  BoclipsOptions,
  defaultBoclipsOptions,
} from '../BoclipsClient/BoclipsClient';
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
  boclips: Partial<BoclipsOptions>;
  player: Partial<WrapperOptions>;
}

export const defaultOptions: PlayerOptions = Object.freeze({
  analytics: defaultAnalyticsOptions,
  boclips: defaultBoclipsOptions,
  player: defaultWrapperOptions,
});
