export const streamVideoSample = Object.freeze({
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
    },
  },
  _links: {
    self: {
      href: '/v1/videos/177',
    },
  },
});

export const youtubeVideoSample = Object.freeze({
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
    },
  },
  _links: {
    self: {
      href: '/v1/videos/177',
    },
  },
});
