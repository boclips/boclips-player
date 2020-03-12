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
  };
  ratio?: '16:9' | '4:3';
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
    singlePlayback: true,
  },
  ratio: undefined,
};
