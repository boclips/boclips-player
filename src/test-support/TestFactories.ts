import { Link } from '../types/Link';
import { Playback, StreamPlayback, YoutubePlayback } from '../types/Playback';

export class PlaybackFactory {
  public static streamSample = (): StreamPlayback => ({
    id: 'stream-playback-id',
    thumbnailUrl: 'some/stream/image.jpg',
    duration: 60,
    type: 'STREAM',
    streamUrl: 'some/stream.mp4',
    links: {
      createPlaybackEvent: new Link({
        href: 'create/playback/event',
      }),
      createPlayerInteractedWithEvent: new Link({
        href: 'create/interaction/event',
      }),
    },
  });

  public static youtubeSample = (): YoutubePlayback => ({
    id: 'youtube-stream-id',
    thumbnailUrl: 'some/youtube/image.jpg',
    duration: 120,
    type: 'YOUTUBE',
    links: {
      createPlaybackEvent: new Link({
        href: 'create/playback/event',
      }),
      createPlayerInteractedWithEvent: new Link({
        href: 'create/interaction/event',
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

export class VideoResourceFactory {
  public static streamSample = () => ({
    id: 'stream-video-id',
    playback: {
      id: 'stream-playback-id',
      type: 'STREAM',
      thumbnailUrl: 'kaltura/poster.jpg',
      streamUrl: 'kaltura/stream.mp4',
      duration: 'PT1M2S',
      _links: {
        createPlaybackEvent: {
          href: 'create/playback/event',
        },
        createPlayerInteractedWithEvent: {
          href: 'create/interaction/event',
        },
      },
    },
    _links: {
      self: {
        href: '/v1/videos/177',
      },
    },
  });

  public static youtubeSample = () => ({
    id: 'youtube-video-id',
    playback: {
      id: 'youtube-playback-id',
      type: 'YOUTUBE',
      thumbnailUrl: 'youtube/poster.jpg',
      duration: 'PT1M3S',
      _links: {
        createPlaybackEvent: {
          href: 'create/playback/event',
        },
        createPlayerInteractedWithEvent: {
          href: 'create/interaction/event',
        },
      },
    },
    _links: {
      self: {
        href: '/v1/videos/177',
      },
    },
  });
}
