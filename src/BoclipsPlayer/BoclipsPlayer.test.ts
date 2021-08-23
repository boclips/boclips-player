import { addListener } from 'resize-detector';
import { MaybeMocked } from 'ts-jest/dist/utils/testing';
import { mocked } from 'ts-jest/utils';
import { AxiosBoclipsApiClient } from '../BoclipsApiClient/AxiosBoclipsApiClient';
import { BoclipsApiClient } from '../BoclipsApiClient/BoclipsApiClient';
import { ErrorHandler } from '../ErrorHandler/ErrorHandler';
import { Analytics } from '../Events/Analytics';
import { MediaPlayerFactory } from '../MediaPlayer/MediaPlayerFactory';
import { VideoFactory } from '../test-support/TestFactories';
import { DeepPartial } from '../types/Utils';
import { Video } from '../types/Video';
import { BoclipsPlayer } from './BoclipsPlayer';
import { PlayerOptions } from './PlayerOptions';

jest.mock('resize-detector');
jest.mock('../Events/Analytics');
jest.mock('../ErrorHandler/ErrorHandler');
jest.mock('../BoclipsApiClient/AxiosBoclipsApiClient.ts');
jest.mock('../MediaPlayer/MediaPlayerFactory.ts');

describe('BoclipsPlayer', () => {
  let container: HTMLElement & { __jsdomMockClientHeight: number };
  let player: BoclipsPlayer;
  let boclipsClient: MaybeMocked<BoclipsApiClient>;

  beforeEach(() => {
    container = document.createElement('div') as any;
    document.body.appendChild(container);
    player = new BoclipsPlayer(container);
    boclipsClient = mocked(AxiosBoclipsApiClient).mock.results[0].value;
  });

  it('Constructs a new player when passed an element', () => {
    expect(player).not.toBeNull();
  });

  it('Will return the container', () => {
    expect(player.getContainer()).toEqual(container);
  });

  it('Will return the media player', () => {
    expect(player.getMediaPlayer().play).toBeTruthy();
  });

  it('Will initialise the media player with the player', () => {
    expect(MediaPlayerFactory.get()).toBeCalledTimes(1);
    expect(MediaPlayerFactory.get()).toHaveBeenCalledWith(player);
  });

  it('Will initialise the event tracker with the player', () => {
    expect(Analytics).toBeCalledTimes(1);
    expect(MediaPlayerFactory.get()).toHaveBeenCalledWith(player);
  });

  // This test triggers the UnhandledPromiseRejectionWarning because the result
  // of retrieveVideo is undefined
  it('Will auto load the video based on data attribute on container', () => {
    const uri = '/v1/videos/177';

    const autoContainer = document.createElement('div');
    autoContainer.setAttribute('data-boplayer-video-uri', uri);
    document.body.appendChild(autoContainer);

    player = new BoclipsPlayer(autoContainer);

    expect(player.getClient().retrieveVideo).toHaveBeenCalledWith(uri);
  });

  const illegalContainers: {
    message: string;
    illegalContainer: any;
  }[] = [
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
        new BoclipsPlayer(illegalContainer);
      }).toThrow(Error);
    });
  });

  it('Will retrieve details from the Playback endpoint', () => {
    const uri = '/v1/videos/177';

    const video = VideoFactory.sample();

    boclipsClient.retrieveVideo.mockReturnValue(
      new Promise((resolve) => resolve(video)),
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
            reject('NOPE');
          }
        }),
    );

    await player.loadVideo(goodUri);
    await player.loadVideo(errorUri);
    await player.loadVideo(goodUri);

    const errorHandler = mocked(ErrorHandler).mock.results[0].value;
    expect(errorHandler.clearError).toHaveBeenCalledTimes(2);

    const calls = mocked(player.getMediaPlayer().configureWithVideo).mock.calls;
    expect(calls).toHaveLength(2);
  });

  describe('Configuring the media player with a video', () => {
    const uri = '/v1/videos/177';

    const video = VideoFactory.sample();

    beforeEach(() => {
      boclipsClient.retrieveVideo.mockReturnValue(
        new Promise((resolve) => resolve(video)),
      );
    });

    it('Will configure the media player with the video', () => {
      return player.loadVideo(uri).then(() => {
        const calls = mocked(player.getMediaPlayer().configureWithVideo).mock
          .calls;
        expect(calls).toHaveLength(1);
        const actualVideo = calls[0][0] as Video;
        expect(actualVideo).toBeTruthy();
        expect(actualVideo).toEqual(video);
      });
    });
  });

  describe('passes through media player methods', () => {
    const passThroughMethods = ['destroy', 'play', 'pause'];

    passThroughMethods.forEach((method) => {
      it(`Will destroy the media player when ${method} is called`, () => {
        player[method]();

        expect(player.getMediaPlayer()[method]).toHaveBeenCalled();
      });
    });
  });

  describe('Options', () => {
    it('passes down analytics options', () => {
      const options: DeepPartial<PlayerOptions> = {
        analytics: {
          metadata: {
            playerId: expect.anything(),
            one: 'one',
          },
        },
      };

      player = new BoclipsPlayer(container, options);

      expect(Analytics).toHaveBeenCalledWith(player);
    });

    it('does not wreck interface.controls', () => {
      const options: DeepPartial<PlayerOptions> = {
        interface: { controls: ['captions', 'duration'] },
      };

      player = new BoclipsPlayer(container, options);

      expect(player.getOptions().interface.controls).toEqual([
        'captions',
        'duration',
      ]);
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
      const callback = mocked(addListener).mock.calls[0][1].bind(container);

      container.__jsdomMockClientHeight = 10;
      callback(container);

      expect(container.style.fontSize).toEqual(12 + 'px');

      container.__jsdomMockClientHeight = 700;
      callback(container);

      expect(container.style.fontSize).toEqual(700 * 0.04 + 'px');

      container.__jsdomMockClientHeight = 1200;
      callback(container);

      expect(container.style.fontSize).toEqual(1200 * 0.04 + 'px');
    });
  });
});
