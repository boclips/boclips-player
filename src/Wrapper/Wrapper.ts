import { Analytics } from '../Events/Analytics';
import { Video } from '../types/Video';
import { WrapperOptions } from './WrapperOptions';

export type WrapperConstructor = new (
  container: HTMLElement,
  analytics: Analytics,
  options: Partial<WrapperOptions>,
) => Wrapper;

export interface Wrapper {
  play: () => Promise<void>;
  pause: () => void;
  configureWithVideo: (video: Video) => void;
  destroy: () => void;
}
