import { Analytics } from '../Events/Analytics';
import { Video } from '../types/Video';

export type WrapperConstructor = new (
  container: HTMLElement,
  analytics: Analytics,
) => Wrapper;

export interface Wrapper {
  play: () => Promise<void>;
  pause: () => void;
  configureWithVideo: (video: Video) => void;
}
