import { Link } from '../types/Link';
import { Playback, StreamPlayback, YoutubePlayback } from '../types/Playback';

export class PlaybackFactory {
  public static streamSample = (
    arg: Partial<StreamPlayback> = {},
  ): StreamPlayback => ({
    id: 'stream-playback-id',
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
      thumbnail: new Link({
        href: 'thumbnail/{thumbnailWidth}.jpg',
        templated: true,
      }),
      videoPreview: new Link({
        href: 'videoPreview/{thumbnailWidth}/{thumbnailCount}.jpg',
        templated: true,
      }),
    },
    ...arg,
  });

  public static youtubeSample = (): YoutubePlayback => ({
    id: 'youtube-stream-id',
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
      streamUrl: 'kaltura/stream.mp4',
      duration: 'PT1M2S',
      _links: {
        createPlaybackEvent: {
          href: 'create/playback/event',
        },
        createPlayerInteractedWithEvent: {
          href: 'create/interaction/event',
        },
        thumbnail: {
          href: 'thumbnail/{thumbnailWidth}.jpg',
          templated: true,
        },
        videoPreview: {
          href: 'videoPreview/{thumbnailWidth}/{thumbnailCount}.jpg',
          templated: true,
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
      duration: 'PT1M3S',
      _links: {
        createPlaybackEvent: {
          href: 'create/playback/event',
        },
        createPlayerInteractedWithEvent: {
          href: 'create/interaction/event',
        },
        thumbnail: {
          href: 'youtube/thumbnail.jpg',
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
