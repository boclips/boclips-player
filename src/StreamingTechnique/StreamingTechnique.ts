import { StreamPlayback } from '../types/Playback';

export interface StreamingTechnique {
  initialise: (playback: StreamPlayback, startPosition: number) => void;
  destroy: () => void;
  startLoad: (startTime: number) => void;
  stopLoad: () => void;
  changeCaptions: (trackNumber: number) => void;
}
