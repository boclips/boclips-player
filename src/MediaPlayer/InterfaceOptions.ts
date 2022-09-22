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
  | 'fullscreen';

export interface InterfaceOptions {
  controls: Controls[];
  addons?: {
    seekPreview?: boolean | SeekPreviewOptions;
    hoverPreview?: boolean | HoverPreviewOptions;
    singlePlayback?: boolean | SinglePlaybackOptions;
    videoLengthPreview?: boolean;
    titleOverlay?: boolean;
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
    videoLengthPreview: false,
    titleOverlay: false,
  },
  ratio: undefined,
};
