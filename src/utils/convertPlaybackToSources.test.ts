import { PlaybackFactory } from '../test-support/TestFactories';
import convertPlaybackToSources from './convertPlaybackToSources';

it('can convert a stream playback to a html5 video source', () => {
  const streamPlayback = PlaybackFactory.streamSample();

  const source = convertPlaybackToSources(streamPlayback);

  expect(source.type).toEqual('video');
  expect(source.poster).toEqual(streamPlayback.thumbnailUrl);
  expect(source.sources).toHaveLength(1);
  expect(source.sources[0].src).toEqual(streamPlayback.streamUrl);
  expect(source.sources[0].provider).toEqual('html5');
});

it('can convert a youtube playback to a youtube video source', () => {
  const youtubePlayback = PlaybackFactory.youtubeSample();

  const source = convertPlaybackToSources(youtubePlayback);

  expect(source.type).toEqual('video');
  expect(source.poster).toEqual(youtubePlayback.thumbnailUrl);
  expect(source.sources).toHaveLength(1);
  expect(source.sources[0].src).toEqual(youtubePlayback.id);
  expect(source.sources[0].provider).toEqual('youtube');
});
