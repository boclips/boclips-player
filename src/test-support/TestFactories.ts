import { Source } from '../Provider/Provider';
import { Link } from '../types/Link';
import { StreamPlayback, YoutubePlayback } from '../types/Playback';

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
  public static streamSample = (): StreamPlayback => ({
    id: 'stream-playback-id',
    thumbnailUrl: 'some/stream/image.jpg',
    duration: 'PT1M',
    type: 'STREAM',
    streamUrl: 'some/stream.mp4',
    links: {
      createPlaybackEvent: new Link({
        href: 'create/playback/event',
      }),
    },
  });

  public static youtubeSample = (): YoutubePlayback => ({
    id: 'youtube-stream-id',
    thumbnailUrl: 'some/youtube/image.jpg',
    duration: 'PT2M',
    type: 'YOUTUBE',
    links: {
      createPlaybackEvent: new Link({
        href: 'create/playback/event',
      }),
    },
  });
}
