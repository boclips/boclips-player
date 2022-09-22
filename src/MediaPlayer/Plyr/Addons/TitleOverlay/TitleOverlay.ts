import { AddonInterface } from '../Addons';
import { EnrichedPlyr } from '../../../../types/plyr';
import { Playback } from '../../../../types/Playback';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { PlaybackSegment } from '../../../MediaPlayer';

export class TitleOverlay implements AddonInterface {
  public static isEnabled(
    _plyr: EnrichedPlyr,
    _playback: Playback,
    _options: InterfaceOptions,
  ): boolean {
    return _options.addons.titleOverlay;
  }

  destroy(): void {}

  updateSegment(_segment: PlaybackSegment): void {}
}
