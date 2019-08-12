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
  addons: {
    seekPreview?: boolean | SeekPreviewOptions;
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
    seekPreview: {
      sliceCount: 10,
    },
  },
};
