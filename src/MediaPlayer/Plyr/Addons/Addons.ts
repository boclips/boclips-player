import Plyr from 'plyr';
import { Playback } from '../../../types/Playback';
import { InterfaceOptions } from '../../InterfaceOptions';
import { SeekPreview } from './SeekPreview';

export interface AddonInterface {
  destroy: () => void;
}

export interface Addon {
  canBeEnabled: (
    plyr: Plyr.Plyr,
    playback: Playback,
    options: InterfaceOptions,
  ) => boolean;
  new (
    plyr: Plyr.Plyr,
    playback: Playback,
    options: InterfaceOptions,
  ): AddonInterface;
}

export const Addons: Addon[] = [SeekPreview];
