import MockFetchVerify from '../test-support/MockFetchVerify';
import { videoPlaybackSample } from '../test-support/video-service-responses';
import retrievePlayback from './retrievePlayback';

it('will make a request to the backend for the playback', () => {
  const sourcePlayback = videoPlaybackSample;

  MockFetchVerify.get(
    '/v1/videos/177/playback',
    JSON.stringify({ playback: sourcePlayback }),
  );

  // MockFetchVerify.post(
  //   '/v1/videos/177/playback',
  //   undefined,
  //   201,
  //   JSON.stringify(sourcePlayback),
  // );

  return retrievePlayback('/v1/videos/177/playback').then(playback =>
    expect(playback).toEqual({
      streamUrl: sourcePlayback.streamUrl,
      thumbnailUrl: sourcePlayback.thumbnailUrl,
    }),
  );
});
