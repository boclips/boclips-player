type Controls =
  | 'play-large'
  | 'play'
  | 'progress'
  | 'current-time'
  | 'mute'
  | 'volume'
  | 'captions'
  | 'fullscreen';

export interface WrapperOptions {
  controls: Controls[];
}

export const defaultOptions: WrapperOptions = {
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
};
