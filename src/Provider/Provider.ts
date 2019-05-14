export type ProviderConstructor = new (video: HTMLVideoElement) => Provider;

export interface Source {
  type: 'audio' | 'video';
  title?: string;
  sources: Array<{
    src: string;
    type?: string;
    size?: number;
    provider: 'html5' | 'youtube';
  }>;
  poster: string;
}

export interface Provider {
  source: Source;
  play: () => void;
}
