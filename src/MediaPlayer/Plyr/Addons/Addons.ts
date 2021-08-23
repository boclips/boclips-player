import { Playback } from '../../../types/Playback';
import { InterfaceOptions } from '../../InterfaceOptions';
import { EnrichedPlyr } from '../../../types/plyr';
import { HoverPreview } from './HoverPreview/HoverPreview';
import { SeekPreview } from './SeekPreview/SeekPreview';
import { SinglePlayback } from './SinglePlayback/SinglePlayback';
import { VideoLengthPreview } from './VideoLengthPreview/VideoLengthPreview';
import { AddonOptions } from '../../../BoclipsPlayer/PlayerOptions';

export interface AddonInterface {
  destroy: () => void;
}

export interface Addon {
  canBeEnabled: (
    plyr: EnrichedPlyr,
    playback: Playback,
    options: InterfaceOptions,
  ) => boolean;
  new (
    plyr: EnrichedPlyr,
    playback: Playback,
    options: AddonOptions,
  ): AddonInterface;
}

export const Addons: Addon[] = [
  SeekPreview,
  HoverPreview,
  SinglePlayback,
  VideoLengthPreview,
];
