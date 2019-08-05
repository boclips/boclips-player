import { isStreamPlayback, Playback } from '../../../types/Playback';
import { Source } from '../types';

const convertPlaybackToSource = (playback: Playback): Source => ({
  type: 'video',
  sources: [
    {
      src: isStreamPlayback(playback) ? playback.streamUrl : playback.id,
      provider: isStreamPlayback(playback) ? 'html5' : 'youtube',
    },
  ],
  poster: playback.thumbnailUrl,
});

export default convertPlaybackToSource;
