import { Source } from '../Provider/Provider';
import { Playback } from '../utils/convertPlaybackResource';

export class SourceFactory {
  public static sample = (): Source => ({
    poster: '/path/to/poster.jpg',
    title: 'new title',
    type: 'video',
    sources: [
      {
        provider: 'html5',
        src: '/path/to/video.mp4',
      },
    ],
  });
}

export class PlaybackFactory {
  public static streamSample = (): Playback => ({
    thumbnailUrl: 'some/stream/image.jpg',
    duration: 'PT1M',
    type: 'STREAM',
    streamUrl: 'some/stream.mp4',
  });

  public static youtubeSample = (): Playback => ({
    thumbnailUrl: 'some/youtube/image.jpg',
    duration: 'PT2M',
    type: 'YOUTUBE',
    id: 'someid123',
  });
}
