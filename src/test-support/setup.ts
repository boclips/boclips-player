// jsdom does not support text tracks in videos
Object.defineProperty(HTMLVideoElement.prototype, 'textTracks', {
  value: { mode: 'disabled' },
});
