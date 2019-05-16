import {
  streamVideoSample,
  youtubeVideoSample,
} from '../test-support/video-service-responses';
import {
  isStreamPlayback,
  isYoutubePlayback,
  StreamPlayback,
  YoutubePlayback,
} from '../types/Playback';
import convertPlaybackResource from './convertPlaybackResource';

it('Can map the response to a StreamPlayback object', () => {
  const playback = convertPlaybackResource(
    streamVideoSample.playback,
  ) as StreamPlayback;
  expect(isStreamPlayback(playback)).toBeTruthy();
  expect(playback.id).toEqual('stream-playback-id');
  expect(playback.type).toEqual('STREAM');
  expect(playback.streamUrl).toEqual('kaltura/stream.mp4');
  expect(playback.thumbnailUrl).toEqual('kaltura/poster.jpg');
  expect(playback.links.createPlaybackEvent.getOriginalLink()).toEqual(
    'create/playback/event',
  );
});

it('Can map the response to a YoutubePlayback object', () => {
  const playback = convertPlaybackResource(
    youtubeVideoSample.playback,
  ) as YoutubePlayback;
  expect(isYoutubePlayback(playback)).toBeTruthy();
  expect(playback.id).toEqual('youtube-playback-id');
  expect(playback.type).toEqual('YOUTUBE');
  expect(playback.thumbnailUrl).toEqual('youtube/poster.jpg');
  expect(playback.links.createPlaybackEvent.getOriginalLink()).toEqual(
    'create/playback/event',
  );
});

it('will throw an exception if the type is not YOUTUBE or STREAM', () => {
  const input = {
    type: 'TESTING',
  };

  expect(() => {
    // tslint:disable-next-line: no-unused-expression
    convertPlaybackResource(input);
  }).toThrowError();
});
