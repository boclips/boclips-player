import { Source } from '../Provider/Provider';
import { Playback } from './convertPlaybackResource';

const convertPlaybackToSources = (playback: Playback): Source => ({
  type: 'video',
  sources: [
    {
      src: playback.type === 'STREAM' ? playback.streamUrl : playback.id,
      provider: playback.type === 'STREAM' ? 'html5' : 'youtube',
    },
  ],
  poster: playback.thumbnailUrl,
});

export default convertPlaybackToSources;
