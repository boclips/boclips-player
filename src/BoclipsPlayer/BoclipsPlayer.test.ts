import { addListener } from 'resize-detector';
import { mocked } from 'jest-mock';
import { Analytics } from '../Events/Analytics';
import { MediaPlayerFactory } from '../MediaPlayer/MediaPlayerFactory';
import { VideoFactory } from '../test-support/TestFactories';
import { DeepPartial } from '../types/Utils';
import { Video } from '../types/Video';
import { BoclipsPlayer } from './BoclipsPlayer';
import { PlayerOptions } from './PlayerOptions';
import { describe, expect, beforeEach, it, jest } from '@jest/globals';
import { ErrorHandlerProps } from '../ErrorHandler/__mocks__/ErrorHandler';

jest.mock('resize-detector');
jest.mock('../Events/Analytics');
jest.mock('../ErrorHandler/ErrorHandler', () => ({
  ErrorHandler: jest.fn().mockImplementation(() => ErrorHandlerProps),
}));
jest.mock('../MediaPlayer/MediaPlayerFactory.ts');

const video = VideoFactory.sample(undefined, 'video title');
jest.mock('../BoclipsApiClient/AxiosBoclipsApiClient.ts', () => {
  return {
    AxiosBoclipsApiClient: jest.fn().mockImplementation(() => {
      return {
        retrieveVideo: jest
          .fn<(_: string) => Promise<Video>>()
          .mockImplementation(
            (uri: string) =>
              new Promise((resolve, reject) => {
                if (uri.includes('error-video')) {
                  reject({
                    response: { status: 404 },
                  });
                } else {
                  resolve(video);
                }
              }),
          ),
      };
    }),
  };
});
describe('BoclipsPlayer', () => {
  let container: HTMLElement & { __jsdomMockClientHeight: number };
  let player: BoclipsPlayer;

  beforeEach(() => {
    container = document.createElement('div') as any;
    document.body.appendChild(container);
    player = new BoclipsPlayer(container);
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

  it('Will auto load the video based on data attribute on container', () => {
    const uri = '/v1/videos/177';

    const autoContainer = document.createElement('div');
    autoContainer.setAttribute('data-boplayer-video-uri', uri);
    document.body.appendChild(autoContainer);

    player = new BoclipsPlayer(autoContainer);

    expect(player.getClient().retrieveVideo).toHaveBeenCalledWith(uri);
  });

  it('Will throw an exception if the container is invalid', () => {
    // @ts-ignore
    expect(() => new BoclipsPlayer(123)).toThrow(Error);
    // @ts-ignore
    expect(() => new BoclipsPlayer('hello')).toThrow(Error);
    // @ts-ignore
    expect(() => new BoclipsPlayer(null)).toThrow(Error);
  });

  describe('retrieve video', () => {
    it('will get video from playback endpoint and have correct the video title', async () => {
      await player.loadVideo('/v1/videos/amazing-video');

      expect(player.getVideoTitle()).toEqual('video title');
      expect(player.getVideo()).toEqual(video);
    });

    it('Will not reload the same video', () => {
      const uri = '/v1/videos/177';

      return player.loadVideo(uri).then(() => {
        return player.loadVideo(uri).then(() => {
          expect(player.getClient().retrieveVideo).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
  describe('error handler', () => {
    it('Will clear errors when successfully loaded a video', () => {
      const uri = '/v1/videos/177';

      return player.loadVideo(uri).then(() => {
        expect(player.getErrorHandler().clearError).toHaveBeenCalled();
      });
    });

    it('Will reload a video if an erroneous video was loaded afterwards', async () => {
      const goodUri = '/v1/videos/177';
      const errorUri = '/v1/videos/error-video';

      await player.loadVideo(goodUri);
      await player.loadVideo(errorUri);
      await player.loadVideo(goodUri);

      expect(player.getErrorHandler().clearError).toHaveBeenCalledTimes(2);

      const calls = mocked(player.getMediaPlayer().configureWithVideo, {
        shallow: true,
      }).mock.calls;
      expect(calls).toHaveLength(2);
    });
  });

  describe('Configuring the media player with a video', () => {
    const uri = '/v1/videos/177';

    it('Will configure the media player with the video', () => {
      return player.loadVideo(uri).then(() => {
        const calls = mocked(player.getMediaPlayer().configureWithVideo, {
          shallow: true,
        }).mock.calls;
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

  it('passes down onReady callback to media player', async () => {
    const onReadyCallback = jest.fn();
    player.onReady(onReadyCallback);

    expect(player.getMediaPlayer().onReady).toHaveBeenCalledWith(
      onReadyCallback,
    );
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

    it('passes down addons.titleOverlay', () => {
      const options: DeepPartial<PlayerOptions> = {
        interface: { addons: { titleOverlay: true } },
      };

      player = new BoclipsPlayer(container, options);

      expect(player.getOptions().interface.addons?.titleOverlay).toBeTruthy();
    });
  });

  it('will delegate axios error handling to the module', async () => {
    const uri = 'http://server/path/to/error-video';

    await player.loadVideo(uri);

    expect(player.getErrorHandler().handleError).toHaveBeenCalledWith({
      fatal: true,
      payload: { statusCode: 404 },
      type: 'API_ERROR',
    });
  });

  it('will render an error if there is an API error', async () => {
    const uri = 'http://server/path/to/error-video';

    await player.loadVideo(uri);

    expect(player.getErrorHandler().handleError).toHaveBeenCalledWith({
      fatal: true,
      payload: { statusCode: 404 },
      type: 'API_ERROR',
    });
  });

  describe('is listening for container resizes', () => {
    it('adds a resize detector', () => {
      expect(addListener).toHaveBeenCalledWith(container, expect.anything());
    });

    it('sets the fontsize to be 4% of the height', () => {
      const callback = mocked(addListener, {
        shallow: true,
      }).mock.calls[0][1].bind(container);

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
