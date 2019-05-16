import MockFetchVerify from '../test-support/MockFetchVerify';
import {
  streamVideoPlaybackSample,
  youtubeVideoPlaybackSample,
} from '../test-support/video-service-responses';
import retrievePlayback from './retrievePlayback';

it('will make a request to the backend for a stream playback', () => {
  const playbackResource = streamVideoPlaybackSample;

  MockFetchVerify.get(
    '/v1/videos/177/playback',
    JSON.stringify({ playback: playbackResource }),
  );

  // MockFetchVerify.post(
  //   '/v1/videos/177/playback',
  //   undefined,
  //   201,
  //   JSON.stringify(sourcePlayback),
  // );

  return retrievePlayback('/v1/videos/177/playback').then(playback =>
    expect(playback).toEqual({
      duration: playbackResource.duration,
      streamUrl: playbackResource.streamUrl,
      thumbnailUrl: playbackResource.thumbnailUrl,
      type: playbackResource.type,
    }),
  );
});

it('will make a request to the backend for a youtube playback', () => {
  const playbackResponse = youtubeVideoPlaybackSample;

  MockFetchVerify.get(
    '/v1/videos/177/playback',
    JSON.stringify({ playback: playbackResponse }),
  );

  // MockFetchVerify.post(
  //   '/v1/videos/177/playback',
  //   undefined,
  //   201,
  //   JSON.stringify(sourcePlayback),
  // );

  return retrievePlayback('/v1/videos/177/playback').then(playback =>
    expect(playback).toEqual({
      duration: playbackResponse.duration,
      id: playbackResponse.id,
      thumbnailUrl: playbackResponse.thumbnailUrl,
      type: playbackResponse.type,
    }),
  );
});
