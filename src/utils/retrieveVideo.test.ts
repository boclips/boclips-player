import MockFetchVerify from '../test-support/MockFetchVerify';
import {
  streamVideoSample,
  youtubeVideoSample,
} from '../test-support/video-service-responses';
import { Link } from '../types/Link';
import retrieveVideo from './retrieveVideo';

it('will make a request to the backend for a stream video', () => {
  const videoResource = streamVideoSample;

  MockFetchVerify.get('/v1/videos/177', JSON.stringify(videoResource));

  return retrieveVideo('/v1/videos/177').then(video =>
    expect(video).toEqual({
      id: videoResource.id,
      playback: {
        id: videoResource.playback.id,
        duration: videoResource.playback.duration,
        streamUrl: videoResource.playback.streamUrl,
        thumbnailUrl: videoResource.playback.thumbnailUrl,
        type: videoResource.playback.type,
        links: {
          createPlaybackEvent: new Link(
            videoResource.playback._links.createPlaybackEvent,
          ),
        },
      },
    }),
  );
});

it('will make a request to the backend for a youtube video', () => {
  const videoResource = youtubeVideoSample;

  MockFetchVerify.get('/v1/videos/177', JSON.stringify(videoResource));

  return retrieveVideo('/v1/videos/177').then(video =>
    expect(video).toEqual({
      id: video.id,
      playback: {
        duration: videoResource.playback.duration,
        id: videoResource.playback.id,
        thumbnailUrl: videoResource.playback.thumbnailUrl,
        type: videoResource.playback.type,
        links: {
          createPlaybackEvent: new Link(
            videoResource.playback._links.createPlaybackEvent,
          ),
        },
      },
    }),
  );
});
