import { AnalyticsInstance } from '../Events/Analytics';
import { Video } from '../types/Video';
import { ErrorHandlerInstance } from '../utils/ErrorHandler';
import { WrapperOptions } from './WrapperOptions';

export type WrapperConstructor = new (
  container: HTMLElement,
  analytics: AnalyticsInstance,
  errorHandler: ErrorHandlerInstance,
  options: Partial<WrapperOptions>,
) => Wrapper;

export interface Wrapper {
  play: () => Promise<void>;
  pause: () => void;
  configureWithVideo: (video: Video) => void;
  destroy: () => void;
}
