import { Link } from '../types/Link';
import { Playback, StreamPlayback, YoutubePlayback } from '../types/Playback';

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

export class VideoFactory {
  public static sample = (
    playback: Playback = PlaybackFactory.streamSample(),
  ) => ({
    id: 'video-id',
    playback,
    links: {
      self: new Link({
        href: '/v1/videos/177',
      }),
    },
  });
}
