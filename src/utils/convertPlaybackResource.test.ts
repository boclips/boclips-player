import { VideoResourceFactory } from '../test-support/TestFactories';
import {
  isStreamPlayback,
  isYoutubePlayback,
  StreamPlayback,
  YoutubePlayback,
} from '../types/Playback';
import convertPlaybackResource from './convertPlaybackResource';
import { expect, it } from '@jest/globals';


it('Can map the response to a StreamPlayback object', () => {
  const playback = convertPlaybackResource(
    VideoResourceFactory.streamSample(),
  ) as StreamPlayback;
  expect(isStreamPlayback(playback)).toBeTruthy();
  expect(playback.id).toEqual('stream-playback-id');
  expect(playback.type).toEqual('STREAM');
  expect(playback.duration).toEqual(62);
  expect(playback.links.createPlaybackEvent.getOriginalLink()).toEqual(
    'create/playback/event',
  );
  expect(
    playback.links.createPlayerInteractedWithEvent.getOriginalLink(),
  ).toEqual('create/interaction/event');
  expect(playback.links.thumbnail.getOriginalLink()).toEqual(
    'thumbnail/{thumbnailWidth}.jpg',
  );
  expect(playback.links.videoPreview.getOriginalLink()).toEqual(
    'videoPreview/{thumbnailWidth}/{thumbnailCount}.jpg',
  );
  expect(playback.links.hlsStream.getOriginalLink()).toEqual(
    'videoStream/hls.mp4',
  );
});

it('Can map the response to a YoutubePlayback object', () => {
  const playback = convertPlaybackResource(
    VideoResourceFactory.youtubeSample(),
  ) as YoutubePlayback;
  expect(isYoutubePlayback(playback)).toBeTruthy();
  expect(playback.id).toEqual('youtube-playback-id');
  expect(playback.type).toEqual('YOUTUBE');
  expect(playback.duration).toEqual(63);
  expect(playback.links.createPlaybackEvent.getOriginalLink()).toEqual(
    'create/playback/event',
  );
  expect(
    playback.links.createPlayerInteractedWithEvent.getOriginalLink(),
  ).toEqual('create/interaction/event');
  expect(playback.links.thumbnail.getOriginalLink()).toEqual(
    'youtube/thumbnail.jpg',
  );
  expect(playback.links.thumbnail.isTemplated()).toEqual(false);
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
