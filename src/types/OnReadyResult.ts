import { EnrichedPlyr } from './plyr';
import { Video } from './Video';

export interface OnReadyResult {
  plyr: EnrichedPlyr;
  video: Video;
}
