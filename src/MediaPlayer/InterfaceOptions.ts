import { HoverPreviewOptions } from './Plyr/Addons/HoverPreview';
import { SeekPreviewOptions } from './Plyr/Addons/SeekPreview';

type Controls =
  | 'play-large'
  | 'restart'
  | 'rewind'
  | 'play'
  | 'fast-forward'
  | 'progress'
  | 'current-time'
  | 'duration'
  | 'mute'
  | 'volume'
  | 'captions'
  | 'settings'
  | 'pip'
  | 'airplay'
  | 'download'
  | 'fullscreen';

export interface InterfaceOptions {
  controls: Controls[];
  addons?: {
    seekPreview?: boolean | SeekPreviewOptions;
    hoverPreview?: boolean | HoverPreviewOptions;
  };
}

export const defaultInterfaceOptions: InterfaceOptions = {
  controls: [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'captions',
    'fullscreen',
  ],
  addons: {
    seekPreview: true,
    hoverPreview: false,
  },
};
