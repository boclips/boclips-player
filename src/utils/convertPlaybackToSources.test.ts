import { Playback } from './convertPlaybackResource';
import convertPlaybackToSources from './convertPlaybackToSources';

it('can convert a kaltura playback to a html5 video source', () => {
  const playback: Playback = {
    streamUrl: 'http://kaltura.com/video/123.mp4',
  };

  expect(convertPlaybackToSources(playback).sources[0].src).toEqual(
    'http://kaltura.com/video/123.mp4',
  );
});
