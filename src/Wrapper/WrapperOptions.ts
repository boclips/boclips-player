// tag::doc[]
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
// end::doc[]

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
