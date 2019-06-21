import { addListener } from 'resize-detector';
import { MaybeMocked } from 'ts-jest/dist/util/testing';
import { mocked } from 'ts-jest/utils';
import { AxiosBoclipsClient } from '../BoclipsClient/AxiosBoclipsClient';
import { BoclipsClient } from '../BoclipsClient/BoclipsClient';
import { ErrorHandler } from '../ErrorHandler/ErrorHandler';
import { Analytics } from '../Events/Analytics';
import { MockWrapper } from '../test-support/MockWrapper';
import { VideoFactory } from '../test-support/TestFactories';
import { Video } from '../types/Video';
import { WrapperConstructor } from '../Wrapper/Wrapper';
import { BoclipsPlayer } from './BoclipsPlayer';
import { PlayerOptions } from './PlayerOptions';

jest.mock('resize-detector');
jest.mock('../Events/Analytics');
jest.mock('../ErrorHandler/ErrorHandler');
jest.mock('../BoclipsClient/AxiosBoclipsClient.ts');

describe('BoclipsPlayer', () => {
  const wrapperConstructor = MockWrapper;
  let container: HTMLElement;
  let player: BoclipsPlayer;
  let boclipsClient: MaybeMocked<BoclipsClient>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    player = new BoclipsPlayer(
      wrapperConstructor as WrapperConstructor,
      container,
    );
    boclipsClient = mocked(AxiosBoclipsClient).mock.results[0].value;
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
      expect.anything(),
    );
  });

  it('Will initialise the event tracker with a player id', () => {
    expect(Analytics).toBeCalledTimes(1);
  });

  it('Will auto load the video based on data attribute on container', () => {
    const uri = '/v1/videos/177';

    const autoContainer = document.createElement('div');
    autoContainer.setAttribute('data-boplayer-video-uri', uri);
    document.body.appendChild(autoContainer);

    player = new BoclipsPlayer(wrapperConstructor, autoContainer);

    expect(player.getBoclipsClient().retrieveVideo).toHaveBeenCalledWith(uri);
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

    const video = VideoFactory.sample();

    boclipsClient.retrieveVideo.mockReturnValue(
      new Promise(resolve => resolve(video)),
    );

    return player.loadVideo(uri).then(() => {
      expect(boclipsClient.retrieveVideo).toHaveBeenCalledWith(uri);

      expect(player.getVideo()).toEqual(video);
    });
  });

  it('Will clear errors when successfully loaded a video', () => {
    const uri = '/v1/videos/177';

    boclipsClient.retrieveVideo.mockResolvedValue(VideoFactory.sample());

    return player.loadVideo(uri).then(() => {
      const errorHandler = mocked(ErrorHandler).mock.results[0].value;
      expect(errorHandler.clearError).toHaveBeenCalled();
    });
  });

  it('Will not reload the same video', () => {
    const uri = '/v1/videos/177';

    boclipsClient.retrieveVideo.mockResolvedValue(VideoFactory.sample());

    return player.loadVideo(uri).then(() => {
      return player.loadVideo(uri).then(() => {
        expect(boclipsClient.retrieveVideo).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('Will reload a video if an erroneous video was loaded afterwards', async () => {
    const goodUri = '/v1/videos/177';
    const errorUri = '/v1/videos';

    boclipsClient.retrieveVideo.mockImplementation(
      (uri: string) =>
        new Promise((resolve, reject) => {
          if (uri === goodUri) {
            resolve(VideoFactory.sample());
          } else {
            reject('NO WAY JOSE');
          }
        }),
    );

    await player.loadVideo(goodUri);
    await player.loadVideo(errorUri);
    await player.loadVideo(goodUri);

    const errorHandler = mocked(ErrorHandler).mock.results[0].value;
    expect(errorHandler.clearError).toHaveBeenCalledTimes(2);

    const calls = mocked(player.getWrapper().configureWithVideo).mock.calls;
    expect(calls).toHaveLength(2);
  });

  it('Will configure the wrapper with the video', () => {
    const uri = '/v1/videos/177';

    const video = VideoFactory.sample();

    boclipsClient.retrieveVideo.mockReturnValue(
      new Promise(resolve => resolve(video)),
    );

    return player.loadVideo(uri).then(() => {
      const calls = mocked(player.getWrapper().configureWithVideo).mock.calls;
      expect(calls).toHaveLength(1);
      const actualVideo = calls[0][0] as Video;
      expect(actualVideo).toBeTruthy();
      expect(actualVideo).toEqual(video);
    });
  });

  it('Will install event tracking when a video is loaded', () => {
    const uri = '/v1/videos/177';

    const video = VideoFactory.sample();

    boclipsClient.retrieveVideo.mockReturnValue(
      new Promise(resolve => resolve(video)),
    );

    return player.loadVideo(uri).then(() => {
      const analytics = player.getAnalytics();

      expect(analytics.configure).toHaveBeenCalledWith(video);
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
      const options: Partial<PlayerOptions> = {
        analytics: {
          metadata: {
            playerId: expect.anything(),
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
      const options: Partial<PlayerOptions> = {
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
        expect.anything(),
        expect.objectContaining(options.player),
      );
    });
  });

  it('will delegate axios error handling to the module', async () => {
    const uri = 'http://server/path/to/error/video';

    boclipsClient.retrieveVideo.mockRejectedValue({
      response: { status: 404 },
    });

    await player.loadVideo(uri);

    const errorHandler = mocked(ErrorHandler).mock.results[0].value;
    expect(errorHandler.handleError).toHaveBeenCalled();

    const args = errorHandler.handleError.mock.calls[0];
    expect(args).toMatchObject([
      {
        fatal: true,
        payload: { statusCode: 404 },
        type: 'API_ERROR',
      },
    ]);
  });

  it('will render an error if there is an API error', async () => {
    const uri = 'http://server/path/to/error/video';

    boclipsClient.retrieveVideo.mockRejectedValue({
      response: { status: 404 },
    });

    await player.loadVideo(uri);

    const errorHandler = mocked(ErrorHandler).mock.results[0].value;
    expect(errorHandler.handleError).toHaveBeenCalled();

    const args = errorHandler.handleError.mock.calls[0];
    expect(args).toMatchObject([
      {
        fatal: true,
        payload: { statusCode: 404 },
        type: 'API_ERROR',
      },
    ]);
  });

  describe('is listening for container resizes', () => {
    it('adds a resize detector', () => {
      expect(addListener).toHaveBeenCalledWith(container, expect.anything());
    });

    it('sets the fontsize to be 4% of the height', () => {
      const callback = mocked(addListener).mock.calls[0][1];

      // @ts-ignore
      container.__jsdomMockClientHeight = 10;
      callback();

      expect(container.style.fontSize).toEqual(12 + 'px');

      // @ts-ignore
      container.__jsdomMockClientHeight = 700;
      callback();

      expect(container.style.fontSize).toEqual(700 * 0.04 + 'px');

      // @ts-ignore
      container.__jsdomMockClientHeight = 1200;
      callback();

      expect(container.style.fontSize).toEqual(1200 * 0.04 + 'px');
    });
  });
});
