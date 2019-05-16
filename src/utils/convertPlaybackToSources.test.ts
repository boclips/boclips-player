import { Playback } from './convertPlaybackResource';
import convertPlaybackToSources from './convertPlaybackToSources';

const streamPlayback: Playback = {
  thumbnailUrl: 'some/stream/image.jpg',
  duration: 'PT1M',
  type: 'STREAM',
  streamUrl: 'some/stream.mp4',
};

const youtubePlayback: Playback = {
  thumbnailUrl: 'some/youtube/image.jpg',
  duration: 'PT2M',
  type: 'YOUTUBE',
  id: 'someid123',
};

it('can convert a stream playback to a html5 video source', () => {
  const source = convertPlaybackToSources(streamPlayback);

  expect(source.type).toEqual('video');
  expect(source.poster).toEqual(streamPlayback.thumbnailUrl);
  expect(source.sources).toHaveLength(1);
  expect(source.sources[0].src).toEqual(streamPlayback.streamUrl);
  expect(source.sources[0].provider).toEqual('html5');
});

it('can convert a youtube playback to a youtube video source', () => {
  const source = convertPlaybackToSources(youtubePlayback);

  expect(source.type).toEqual('video');
  expect(source.poster).toEqual(youtubePlayback.thumbnailUrl);
  expect(source.sources).toHaveLength(1);
  expect(source.sources[0].src).toEqual(youtubePlayback.id);
  expect(source.sources[0].provider).toEqual('youtube');
});
