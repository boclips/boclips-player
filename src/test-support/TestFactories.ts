import { Link } from '../types/Link';
import { Playback, StreamPlayback, YoutubePlayback } from '../types/Playback';
import { Video } from '../types/Video';

export class PlaybackFactory {
  public static streamSample = (
    arg: Partial<StreamPlayback> = {},
  ): StreamPlayback => ({
    title: 'Stream video title',
    id: 'stream-playback-id',
    duration: 60,
    type: 'STREAM',
    links: {
      createPlaybackEvent: new Link({
        href: 'https://events/create/playback/event',
      }),
      createPlayerInteractedWithEvent: new Link({
        href: 'https://events/create/interaction/event',
      }),
      thumbnail: new Link({
        href: 'https://thumbnail/{thumbnailWidth}.jpg',
        templated: true,
      }),
      videoPreview: new Link({
        href: 'https://video-preview/{thumbnailWidth}/{thumbnailCount}.jpg',
        templated: true,
      }),
      hlsStream: new Link({
        href: 'videoStream/hls.mp4',
      }),
    },
    ...arg,
  });

  public static podcastSample = (
    arg: Partial<StreamPlayback> = {},
  ): StreamPlayback => ({
    title: 'Podcast title',
    id: 'podcast-playback-id',
    duration: 60,
    type: 'PODCAST',
    links: {
      createPlaybackEvent: new Link({
        href: 'https://events/create/playback/event',
      }),
      createPlayerInteractedWithEvent: new Link({
        href: 'https://events/create/interaction/event',
      }),
      hlsStream: new Link({
        href: 'videoStream/hls.mp4',
      }),
    },
    ...arg,
  });

  public static youtubeSample = (): YoutubePlayback => ({
    id: 'youtube-stream-id',
    title: 'Youtube video title',
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
    title: string = 'title',
  ): Video => ({
    id: 'video-id',
    title,
    description: 'description',
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
        hlsStream: {
          href: 'videoStream/hls.mp4',
        },
      },
    },
    _links: {
      self: {
        href: '/v1/videos/177',
      },
    },
  });

  public static podcastSample = () => ({
    id: 'podcast-video-id',
    playback: {
      id: 'podcast-playback-id',
      type: 'PODCAST',
      duration: 'PT1M2S',
      _links: {
        createPlaybackEvent: {
          href: 'create/playback/event',
        },
        createPlayerInteractedWithEvent: {
          href: 'create/interaction/event',
        },
        hlsStream: {
          href: 'videoStream/hls.mp4',
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
