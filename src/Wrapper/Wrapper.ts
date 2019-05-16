import { EventTracker } from '../Analytics/EventTracker';

export type WrapperConstructor = new (container: HTMLElement) => Wrapper;

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

export interface Wrapper {
  source: Source;
  play: () => Promise<void>;
  pause: () => void;
  installEventTracker: (eventTracker: EventTracker) => void;
}
