import { EventTracker } from '../Analytics/EventTracker';
import { Video } from '../types/Video';

export type WrapperConstructor = new (container: HTMLElement) => Wrapper;

export interface Wrapper {
  play: () => Promise<void>;
  pause: () => void;
  configureWithVideo: (video: Video) => void;
  installEventTracker: (eventTracker: EventTracker) => void;
}
