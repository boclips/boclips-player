import { GeneralButtonOptions } from './Plyr/Addons/GeneralButton/GeneralButton';
import { HoverPreviewOptions } from './Plyr/Addons/HoverPreview/HoverPreview';
import { SeekPreviewOptions } from './Plyr/Addons/SeekPreview/SeekPreview';
import { SinglePlaybackOptions } from './Plyr/Addons/SinglePlayback/SinglePlayback';

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
    singlePlayback?: boolean | SinglePlaybackOptions;
    rewatchButton?: boolean;
    generalButtons?: GeneralButtonOptions[];
  };
  ratio?: '16:9' | '4:3';
}

export const defaultInterfaceOptions: InterfaceOptions = {
  controls: [
    'play-large',
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
    singlePlayback: true,
    rewatchButton: false,
    generalButtons: null,
  },
  ratio: undefined,
};
