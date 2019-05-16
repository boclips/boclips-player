import { Source } from '../Provider/Provider';
import { isStreamPlayback, Playback } from '../types/Playback';

const convertPlaybackToSources = (playback: Playback): Source => ({
  type: 'video',
  sources: [
    {
      src: isStreamPlayback(playback) ? playback.streamUrl : playback.id,
      provider: isStreamPlayback(playback) ? 'html5' : 'youtube',
    },
  ],
  poster: playback.thumbnailUrl,
});

export default convertPlaybackToSources;
