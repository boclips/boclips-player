import { Playback } from '../../../types/Playback';
import { InterfaceOptions } from '../../InterfaceOptions';
import { EnrichedPlyr } from '../../../types/plyr';
import { PlaybackSegment } from '../../MediaPlayer';
import { HoverPreview } from './HoverPreview/HoverPreview';
import { SeekPreview } from './SeekPreview/SeekPreview';
import { SinglePlayback } from './SinglePlayback/SinglePlayback';
import { VideoLengthPreview } from './VideoLengthPreview/VideoLengthPreview';
import { TitleOverlay } from './TitleOverlay/TitleOverlay';

export interface AddonInterface {
  destroy: () => void;
  updateSegment: (segment: PlaybackSegment) => void;
}

export interface Addon {
  isEnabled: (
    plyr: EnrichedPlyr,
    playback: Playback,
    options: InterfaceOptions,
    contentPartner?: string,
  ) => boolean;
  new (
    plyr: EnrichedPlyr,
    playback: Playback,
    options: InterfaceOptions,
  ): AddonInterface;
}

export const Addons: Addon[] = [
  SeekPreview,
  HoverPreview,
  SinglePlayback,
  VideoLengthPreview,
  TitleOverlay,
];
