import { Playback } from '../../../types/Playback';
import { InterfaceOptions } from '../../InterfaceOptions';
import { SeekPreview } from './SeekPreview';

export interface AddonInterface {
  destroy: () => void;
}

export interface Addon {
  canBeEnabled: (playback: Playback, options: InterfaceOptions) => boolean;
  new (options: InterfaceOptions, plyr, playback: Playback): AddonInterface;
}

export const Addons: Addon[] = [SeekPreview];
