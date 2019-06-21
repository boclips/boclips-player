import MockFetchVerify from '../test-support/MockFetchVerify';
import { VideoResourceFactory } from '../test-support/TestFactories';
import { Link } from '../types/Link';
import { AxiosBoclipsClient } from './AxiosBoclipsClient';

let boclipsClient;

beforeEach(() => {
  boclipsClient = new AxiosBoclipsClient();
});

describe('retrieve video', () => {
  it('will make a request to the backend for a stream video', () => {
    const videoResource = VideoResourceFactory.streamSample();

    MockFetchVerify.get('/v1/videos/177', JSON.stringify(videoResource));

    return boclipsClient.retrieveVideo('/v1/videos/177').then(video =>
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
        links: {
          self: new Link(videoResource._links.self),
        },
      }),
    );
  });

  it('will make a request to the backend for a youtube video', () => {
    const videoResource = VideoResourceFactory.youtubeSample();

    MockFetchVerify.get('/v1/videos/177', JSON.stringify(videoResource));

    return boclipsClient.retrieveVideo('/v1/videos/177').then(video =>
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
        links: {
          self: new Link(videoResource._links.self),
        },
      }),
    );
  });

  it('Will use a bearer token if provided with a factory', async () => {
    const uri = '/v1/videos/177';

    const videoResource = VideoResourceFactory.youtubeSample();

    MockFetchVerify.get(uri, JSON.stringify(videoResource));

    const authenticatedClient = new AxiosBoclipsClient({
      tokenFactory: () => new Promise(resolve => resolve('test-bearer-token')),
    });

    return authenticatedClient.retrieveVideo(uri).then(() => {
      const requests = MockFetchVerify.getHistory().get;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(request.headers).toMatchObject({
        Authorization: 'Bearer test-bearer-token',
      });
    });
  });

  it('Will fail gracefully if a token factory throws an exception', async () => {
    const uri = '/v1/videos/177';

    const videoResource = VideoResourceFactory.youtubeSample();

    MockFetchVerify.get(uri, JSON.stringify(videoResource));

    const authenticatedClient = new AxiosBoclipsClient({
      tokenFactory: () =>
        new Promise(() => {
          throw new Error('Some fatal authorization error');
        }),
    });

    return authenticatedClient.retrieveVideo(uri).catch(error => {
      expect(error).not.toBeNull();
    });
  });
});
