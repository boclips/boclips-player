import { MaybeMocked } from 'ts-jest/dist/util/testing';
import { mocked } from 'ts-jest/utils';
import { BoclipsPlayer, PrivatePlayer } from '../BoclipsPlayer/BoclipsPlayer';
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
      expect(video).toMatchObject({
        id: video.id,
        playback: {
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
});

describe('Creating a playback event', () => {
  let video: Video;

  beforeEach(() => {
    video = VideoFactory.sample();
    MockFetchVerify.post(
      video.playback.links.createPlaybackEvent.getOriginalLink(),
      undefined,
      201,
    );
  });

  it('Will create a playback event', () => {
    const expectedEvent: PlaybackEvent = {
      videoId: video.id,
      segmentStartSeconds: 15,
      segmentEndSeconds: 30,
      videoDurationSeconds: 60,
      playerId: 'player-id',
    };

    return boclipsClient.emitPlaybackEvent(video, 15, 30).then(() => {
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

    return boclipsClient.emitPlaybackEvent(video, 15, 30, metadata).then(() => {
      const requests = MockFetchVerify.getHistory().post;
      expect(requests).toHaveLength(1);

      const request = requests[0];
      expect(JSON.parse(request.data)).toMatchObject(metadata);
    });
  });

  it('does not allow overriding of properties via metadata', () => {
    const metadata = {
      segmentStartSeconds: 100000000,
    };

    return boclipsClient.emitPlaybackEvent(video, 15, 30, metadata).then(() => {
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

    return boclipsClient.emitPlaybackEvent(video, 15, 30);
  });
});

describe('Creating a player interaction event ', () => {
  let video: Video;

  beforeEach(() => {
    video = VideoFactory.sample();
    MockFetchVerify.post(
      video.playback.links.createPlayerInteractedWithEvent.getOriginalLink(),
      undefined,
      201,
    );
  });

  it('maps a captions-on event correctly', () => {
    const expectedEvent: PlayerInteractedWithEvent<'captions-on'> = {
      playerId: 'player-id',
      videoId: video.id,
      videoDurationSeconds: 60,
      currentTime: 30,
      subtype: 'captions-on',
      payload: {
        id: 'caption-id',
        kind: 'caption-kind',
        label: 'caption-label',
        language: 'caption-language',
      },
    };

    return boclipsClient
      .emitPlayerInteractionEvent(video, 30, 'captions-on', {
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
        expect(JSON.parse(request.data).subtype).toEqual('captions-on');
        expect(JSON.parse(request.data).payload.id).toEqual('caption-id');
        expect(JSON.parse(request.data).payload.kind).toEqual('caption-kind');
        expect(JSON.parse(request.data).payload.label).toEqual('caption-label');
        expect(JSON.parse(request.data).payload.language).toEqual(
          'caption-language',
        );
      });
  });

  it('maps a fullscreen-on event correctly', () => {
    const expectedEvent: PlayerInteractedWithEvent<'fullscreen-on'> = {
      playerId: 'player-id',
      videoId: video.id,
      videoDurationSeconds: 60,
      currentTime: 30,
      subtype: 'fullscreen-on',
      payload: {},
    };

    return boclipsClient
      .emitPlayerInteractionEvent(video, 30, 'fullscreen-on', {})
      .then(() => {
        const requests = MockFetchVerify.getHistory().post;
        expect(requests).toHaveLength(1);

        const request = requests[0];
        expect(JSON.parse(request.data)).toEqual(expectedEvent);
        expect(JSON.parse(request.data).subtype).toEqual('fullscreen-on');
        expect(JSON.parse(request.data).payload).toEqual({});
      });
  });
});

describe('With authorisation', () => {
  it('Will use a bearer token if provided with a factory', async () => {
    const uri = '/v1/videos/177';

    const videoResource = VideoResourceFactory.youtubeSample();

    MockFetchVerify.get(uri, JSON.stringify(videoResource));

    player.getOptions.mockReturnValue({
      api: {
        tokenFactory: jest.fn().mockResolvedValue('test-bearer-token'),
      },
    });

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

    player.getOptions.mockReturnValue({
      api: {
        tokenFactory: jest
          .fn()
          .mockRejectedValue(new Error('Some fatal authorization error')),
      },
    });

    return boclipsClient.retrieveVideo(uri).catch(error => {
      expect(error).not.toBeNull();
      done();
    });
  });
});
