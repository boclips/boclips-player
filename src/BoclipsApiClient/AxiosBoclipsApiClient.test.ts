import { MaybeMocked } from 'ts-jest/dist/util/testing';
import { mocked } from 'ts-jest/utils';
import { BoclipsPlayer, PrivatePlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { PlayerOptions } from '../BoclipsPlayer/PlayerOptions';
import {
  PlaybackEvent,
  PlayerInteractedWithEvent,
} from '../Events/AnalyticsEvents';
import MockFetchVerify from '../test-support/MockFetchVerify';
import {
  VideoFactory,
  VideoResourceFactory,
} from '../test-support/TestFactories';
import { Link } from '../types/Link';
import { Video } from '../types/Video';
import { AxiosBoclipsApiClient } from './AxiosBoclipsApiClient';

jest.mock('../BoclipsPlayer/BoclipsPlayer');

let player: MaybeMocked<PrivatePlayer>;
let boclipsClient: AxiosBoclipsApiClient;

beforeEach(() => {
  player = mocked(new BoclipsPlayer(null));
  boclipsClient = new AxiosBoclipsApiClient(player);
});

describe('retrieve video', () => {
  it('will make a request to the backend for a stream video', () => {
    const videoResource = VideoResourceFactory.streamSample();

    MockFetchVerify.get('/v1/videos/177', JSON.stringify(videoResource));

    return boclipsClient.retrieveVideo('/v1/videos/177').then(video =>
      expect(video).toMatchObject({
        id: videoResource.id,
        playback: {
          id: videoResource.playback.id,
          type: videoResource.playback.type,
          links: {
            createPlaybackEvent: new Link(
              videoResource.playback._links.createPlaybackEvent,
            ),
            hlsStream: new Link(videoResource.playback._links.hlsStream),
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
      expect(video).toMatchObject({
        id: video.id,
        playback: {
          id: videoResource.playback.id,
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
});

describe('Creating a playback event', () => {
  let video: Video;

  beforeEach(() => {
    video = VideoFactory.sample();
    player.getVideo.mockReturnValue(video);
    MockFetchVerify.post(
      video.playback.links.createPlaybackEvent.getOriginalLink(),
      undefined,
      201,
    );
  });

  it('Will not emit an event if there is no video', () => {
    player.getVideo.mockReturnValue(undefined);

    return boclipsClient.emitPlaybackEvent(15, 30).then(() => {
      const requests = MockFetchVerify.getHistory().post;
      expect(requests).toHaveLength(0);
    });
  });

  it('Will create a playback event', () => {
    const expectedEvent: PlaybackEvent = {
      videoId: video.id,
      segmentStartSeconds: 15,
      segmentEndSeconds: 30,
      videoDurationSeconds: 60,
    };

    return boclipsClient.emitPlaybackEvent(15, 30).then(() => {
      const requests = MockFetchVerify.getHistory().post;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(JSON.parse(request.data)).toEqual(expectedEvent);
    });
  });

  it('will pass through the metadata to the endpoint', () => {
    const metadata = {
      testing: '123',
      someId: 'abc',
    };

    return boclipsClient.emitPlaybackEvent(15, 30, metadata).then(() => {
      const requests = MockFetchVerify.getHistory().post;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(JSON.parse(request.data)).toMatchObject(metadata);
    });
  });

  it('metadata can be a function producing a value', () => {
    const metadata = {
      query: () => 'test',
      simple: 'hello',
    };

    return boclipsClient.emitPlaybackEvent(15, 30, metadata).then(() => {
      const requests = MockFetchVerify.getHistory().post;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(JSON.parse(request.data)).toMatchObject({
        query: 'test',
        simple: 'hello',
      });
    });
  });

  it('does not allow overriding of properties via metadata', () => {
    const metadata = {
      segmentStartSeconds: 100000000,
    };

    return boclipsClient.emitPlaybackEvent(15, 30, metadata).then(() => {
      const requests = MockFetchVerify.getHistory().post;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(request.data.segmentStartSeconds).not.toEqual(
        metadata.segmentStartSeconds,
      );
      expect(JSON.parse(request.data).segmentStartSeconds).toEqual(15);
    });
  });

  it('Will gracefully handle an API error', () => {
    MockFetchVerify.clear();
    MockFetchVerify.post(
      video.playback.links.createPlaybackEvent.getOriginalLink(),
      undefined,
      500,
    );

    return boclipsClient.emitPlaybackEvent(15, 30);
  });
});

describe('Creating a player interaction event ', () => {
  let video: Video;

  beforeEach(() => {
    video = VideoFactory.sample();
    player.getVideo.mockReturnValue(video);
    MockFetchVerify.post(
      video.playback.links.createPlayerInteractedWithEvent.getOriginalLink(),
      undefined,
      201,
    );
  });

  it('maps a captionsEnabled event correctly', () => {
    const expectedEvent: PlayerInteractedWithEvent<'captionsEnabled'> = {
      videoId: video.id,
      videoDurationSeconds: 60,
      currentTime: 30,
      subtype: 'captionsEnabled',
      payload: {
        id: 'caption-id',
        kind: 'caption-kind',
        label: 'caption-label',
        language: 'caption-language',
      },
    };

    return boclipsClient
      .emitPlayerInteractionEvent(30, 'captionsEnabled', {
        id: 'caption-id',
        kind: 'caption-kind',
        label: 'caption-label',
        language: 'caption-language',
      })
      .then(() => {
        const requests = MockFetchVerify.getHistory().post;
        expect(requests).toHaveLength(1);

        const request = requests[0];
        expect(JSON.parse(request.data)).toEqual(expectedEvent);
      });
  });

  it('maps a fullscreenEnabled event correctly', () => {
    const expectedEvent: PlayerInteractedWithEvent<'fullscreenEnabled'> = {
      videoId: video.id,
      videoDurationSeconds: 60,
      currentTime: 30,
      subtype: 'fullscreenEnabled',
      payload: {},
    };

    return boclipsClient
      .emitPlayerInteractionEvent(30, 'fullscreenEnabled', {})
      .then(() => {
        const requests = MockFetchVerify.getHistory().post;
        expect(requests).toHaveLength(1);

        const request = requests[0];
        expect(JSON.parse(request.data)).toEqual(expectedEvent);
      });
  });
});

describe('With authorisation', () => {
  it('Will use a bearer token if provided with a factory', async () => {
    const uri = '/v1/videos/177';

    const videoResource = VideoResourceFactory.youtubeSample();

    MockFetchVerify.get(uri, JSON.stringify(videoResource));

    player.getOptions.mockReturnValue(({
      api: {
        tokenFactory: jest.fn().mockResolvedValue('test-bearer-token'),
      },
    } as any) as PlayerOptions);

    return boclipsClient.retrieveVideo(uri).then(() => {
      const requests = MockFetchVerify.getHistory().get;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(request.headers).toMatchObject({
        Authorization: 'Bearer test-bearer-token',
      });
    });
  });

  it('Will fail gracefully if a token factory throws an exception', done => {
    const uri = '/v1/videos/177';

    const videoResource = VideoResourceFactory.youtubeSample();

    MockFetchVerify.get(uri, JSON.stringify(videoResource));

    player.getOptions.mockReturnValue(({
      api: {
        tokenFactory: jest
          .fn()
          .mockRejectedValue(new Error('Some fatal authorization error')),
      },
    } as any) as PlayerOptions);

    return boclipsClient.retrieveVideo(uri).catch(error => {
      expect(error).not.toBeNull();
      done();
    });
  });

  it('Will not add authorization headers if the token factory returns null', () => {
    const uri = '/v1/videos/177';

    const videoResource = VideoResourceFactory.youtubeSample();

    MockFetchVerify.get(uri, JSON.stringify(videoResource));

    player.getOptions.mockReturnValue(({
      api: {
        tokenFactory: jest.fn().mockResolvedValue(null),
      },
    } as any) as PlayerOptions);

    return boclipsClient.retrieveVideo(uri).then(() => {
      const requests = MockFetchVerify.getHistory().get;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(request.headers).toMatchObject({});
    });
  });
});

describe('with user ID factory', () => {
  it('Will not send user ID over on retrieveVideo if user id factory is not provided', async () => {
    const uri = '/v1/videos/177';

    const videoResource = VideoResourceFactory.youtubeSample();

    MockFetchVerify.get(uri, JSON.stringify(videoResource));

    player.getOptions.mockReturnValue(({
      api: {
        userIdFactory: undefined,
      },
    } as any) as PlayerOptions);

    return boclipsClient.retrieveVideo(uri).then(() => {
      const requests = MockFetchVerify.getHistory().get;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(request.headers).not.toHaveProperty('Boclips-User-Id');
    });
  });

  it('Will send a user id over on retrieveVideo if provided with a user id factory', async () => {
    const uri = '/v1/videos/177';

    const videoResource = VideoResourceFactory.youtubeSample();

    MockFetchVerify.get(uri, JSON.stringify(videoResource));

    player.getOptions.mockReturnValue(({
      api: {
        userIdFactory: jest.fn().mockResolvedValue('test-user-id'),
      },
    } as any) as PlayerOptions);

    return boclipsClient.retrieveVideo(uri).then(() => {
      const requests = MockFetchVerify.getHistory().get;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(request.headers).toMatchObject({
        'Boclips-User-Id': 'test-user-id',
      });
    });
  });

  it('Will send a user id over on emitPlaybackEvent if provided with a user id factory', async () => {
    const uri = 'https://events/create/playback/event';

    MockFetchVerify.post(uri, undefined, 201);

    player.getOptions.mockReturnValue(({
      api: {
        userIdFactory: jest.fn().mockResolvedValue('test-user-id'),
      },
    } as any) as PlayerOptions);

    return boclipsClient.emitPlaybackEvent(0, 10).then(() => {
      const requests = MockFetchVerify.getHistory().post;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(request.headers).toMatchObject({
        'Boclips-User-Id': 'test-user-id',
      });
    });
  });
});
