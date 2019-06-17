import { mocked } from 'ts-jest/utils';
import { Analytics } from '../Events/Analytics';
import eventually from '../test-support/eventually';
import MockFetchVerify from '../test-support/MockFetchVerify';
import { MockWrapper } from '../test-support/MockWrapper';
import { VideoResourceFactory } from '../test-support/TestFactories';
import { isStreamPlayback, StreamPlayback } from '../types/Playback';
import { Video } from '../types/Video';
import { clearError, errorHandler } from '../utils/errorHandler';
import { WrapperConstructor } from '../Wrapper/Wrapper';
import { BoclipsPlayer } from './BoclipsPlayer';
import { BoclipsPlayerOptions } from './BoclipsPlayerOptions';

jest.mock('../Events/Analytics');
jest.mock('../utils/errorHandler');

describe('BoclipsPlayer', () => {
  const wrapperConstructor = MockWrapper;
  let container: HTMLElement;
  let player: BoclipsPlayer;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    player = new BoclipsPlayer(
      wrapperConstructor as WrapperConstructor,
      container,
    );
  });

  it('Constructs a new player when passed an element', () => {
    expect(player).not.toBeNull();
  });

  it('Will return the container', () => {
    expect(player.getContainer()).toEqual(container);
  });

  it('Will return the wrapper', () => {
    expect(player.getWrapper().play).toBeTruthy();
  });

  it('Will initialise the wrapper with the container', () => {
    expect(wrapperConstructor).toBeCalledTimes(1);
    expect(wrapperConstructor).toHaveBeenCalledWith(
      container,
      expect.anything(),
      expect.anything(),
    );
  });

  it('Will initialise the event tracker with a player id', () => {
    expect(Analytics).toBeCalledTimes(1);
  });

  it('Will auto load the video based on data attribute on container', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(
      uri,
      JSON.stringify(VideoResourceFactory.streamSample()),
    );

    const autoContainer = document.createElement('div');
    autoContainer.setAttribute('data-boplayer-video-uri', uri);
    document.body.appendChild(autoContainer);

    const autoPlayer = new BoclipsPlayer(wrapperConstructor, autoContainer);

    return eventually(() => {
      const playback = autoPlayer.getVideo().playback;
      expect(isStreamPlayback(playback)).toBeTruthy();
      expect((playback as StreamPlayback).streamUrl).toEqual(
        'kaltura/stream.mp4',
      );
    });
  });

  const illegalContainers: Array<{
    message: string;
    illegalContainer: any;
  }> = [
    {
      message: 'null',
      illegalContainer: null,
    },
    {
      message: 'a string',
      illegalContainer: 'hello',
    },
    {
      message: 'a number',
      illegalContainer: 123,
    },
  ];

  illegalContainers.forEach(({ message, illegalContainer }) => {
    it('Will throw an exception if the container ' + message, () => {
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new BoclipsPlayer(wrapperConstructor, illegalContainer);
      }).toThrow(Error);
    });
  });

  it('Will throw an exception if the wrapperConstructor is null', () => {
    expect(() => {
      // tslint:disable-next-line: no-unused-expression
      new BoclipsPlayer(null, container);
    }).toThrow(Error);
  });

  it('Will retrieve details from the Playback endpoint', () => {
    const uri = '/v1/videos/177';
    MockFetchVerify.get(
      uri,
      JSON.stringify(VideoResourceFactory.streamSample()),
    );

    return player.loadVideo(uri).then(() => {
      const playback = player.getVideo().playback;
      expect(isStreamPlayback(playback)).toBeTruthy();
      expect((playback as StreamPlayback).streamUrl).toEqual(
        'kaltura/stream.mp4',
      );
    });
  });

  it('Will clear errors when successfully loaded a video', () => {
    const uri = '/v1/videos/177';
    MockFetchVerify.get(
      uri,
      JSON.stringify(VideoResourceFactory.streamSample()),
    );

    return player.loadVideo(uri).then(() => {
      expect(clearError).toHaveBeenCalledWith(container);
    });
  });

  it('Will not reload the same video', () => {
    const uri = '/v1/videos/177';
    MockFetchVerify.get(
      uri,
      JSON.stringify(VideoResourceFactory.streamSample()),
    );

    return player.loadVideo(uri).then(() => {
      const playback = player.getVideo().playback;
      expect(isStreamPlayback(playback)).toBeTruthy();
      return player.loadVideo(uri).then(() => {
        expect(MockFetchVerify.getHistory().get).toHaveLength(1);
      });
    });
  });

  it('Will reload a video if an erroneous video was loaded afterwards', async () => {
    const goodUri = '/v1/videos/177';
    MockFetchVerify.get(
      goodUri,
      JSON.stringify(VideoResourceFactory.streamSample()),
    );

    const errorUri = '/v1/videos';
    MockFetchVerify.get(errorUri, {}, 404);

    await player.loadVideo(goodUri);
    await player.loadVideo(errorUri);
    await player.loadVideo(goodUri);

    expect(clearError).toHaveBeenCalledTimes(2);

    const calls = mocked(player.getWrapper().configureWithVideo).mock.calls;
    expect(calls).toHaveLength(2);
  });

  it('Will configure the wrapper with the video', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(
      uri,
      JSON.stringify(VideoResourceFactory.streamSample()),
    );

    return player.loadVideo(uri).then(() => {
      const calls = mocked(player.getWrapper().configureWithVideo).mock.calls;
      expect(calls).toHaveLength(1);
      const video = calls[0][0] as Video;
      expect(video).toBeTruthy();
      expect(video.id).toEqual(VideoResourceFactory.streamSample().id);
    });
  });

  it('Will install event tracking when a video is loaded', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(
      uri,
      JSON.stringify(VideoResourceFactory.youtubeSample()),
    );

    return player.loadVideo(uri).then(() => {
      const analytics = player.getAnalytics();

      expect(analytics.configure).toHaveBeenCalled();
    });
  });

  describe('passes through wrapper methods', () => {
    const passThroughMethods = ['destroy', 'play', 'pause'];

    passThroughMethods.forEach(method => {
      it(`Will destroy the wrapper when ${method} is called`, () => {
        player[method]();

        expect(player.getWrapper()[method]).toHaveBeenCalled();
      });
    });
  });

  describe('Options', () => {
    it('passes down analytics options', () => {
      const options: Partial<BoclipsPlayerOptions> = {
        analytics: {
          metadata: {
            one: 'one',
          },
        },
      };

      player = new BoclipsPlayer(
        wrapperConstructor as WrapperConstructor,
        container,
        options,
      );

      expect(Analytics).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(options.analytics),
      );
    });

    it('passes down wrapper options', () => {
      const options: Partial<BoclipsPlayerOptions> = {
        player: {
          controls: ['captions'],
        },
      };

      player = new BoclipsPlayer(
        wrapperConstructor as WrapperConstructor,
        container,
        options,
      );

      expect(MockWrapper).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining(options.player),
      );
    });
  });

  describe('error message handling', () => {
    it('will delegate axios error handling to the module', async () => {
      const uri = 'http://server/path/to/error/video';
      MockFetchVerify.get(uri, {}, 404);
      await player.loadVideo(uri);

      expect(errorHandler).toHaveBeenCalledWith(expect.anything(), container);
    });
  });
});
