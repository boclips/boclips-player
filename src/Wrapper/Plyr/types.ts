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
