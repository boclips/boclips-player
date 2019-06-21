import { Video } from '../types/Video';
import { noop } from '../utils';

export interface AnalyticsOptions {
  metadata: { [key: string]: any };
  handleOnSegmentPlayback: (
    video: Video,
    startSeconds: number,
    endSeconds: number,
  ) => void;
}

export const defaultOptions: AnalyticsOptions = Object.freeze({
  metadata: {},
  handleOnSegmentPlayback: noop,
});
