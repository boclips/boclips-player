import { Source } from '../Provider/Provider';
import { Playback } from './convertPlaybackResource';

const convertPlaybackToSources = (playback: Playback): Source => ({
  type: 'video',
  sources: [
    {
      src: playback.streamUrl,
      provider: 'html5',
    },
  ],
  poster: playback.thumbnailUrl,
});

export default convertPlaybackToSources;
