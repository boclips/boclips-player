import { mocked } from 'ts-jest/utils';
import { Analytics } from '../Events/Analytics';
import eventually from '../test-support/eventually';
import MockFetchVerify from '../test-support/MockFetchVerify';
import { MockWrapper } from '../test-support/MockWrapper';
import {
  streamVideoSample,
  youtubeVideoSample,
} from '../test-support/video-service-responses';
import { isStreamPlayback, StreamPlayback } from '../types/Playback';
import { Video } from '../types/Video';
import { WrapperConstructor } from '../Wrapper/Wrapper';
import { BoclipsPlayer } from './BoclipsPlayer';

jest.mock('../Events/Analytics');

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
    );
  });

  it('Will initialise the event tracker with a player id', () => {
    expect(Analytics).toBeCalledTimes(1);
  });

  it('Will auto load the video based on data attribute on container', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(uri, JSON.stringify(streamVideoSample));

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
      message: 'an unattached div',
      illegalContainer: document.createElement('div'),
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
    MockFetchVerify.get(uri, JSON.stringify(streamVideoSample));

    return player.loadVideo(uri).then(() => {
      const playback = player.getVideo().playback;
      expect(isStreamPlayback(playback)).toBeTruthy();
      expect((playback as StreamPlayback).streamUrl).toEqual(
        'kaltura/stream.mp4',
      );
    });
  });

  it('Will configure the wrapper with the video', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(uri, JSON.stringify(streamVideoSample));

    return player.loadVideo(uri).then(() => {
      const calls = mocked(player.getWrapper().configureWithVideo).mock.calls;
      expect(calls).toHaveLength(1);
      const video = calls[0][0] as Video;
      expect(video).toBeTruthy();
      expect(video.id).toEqual(streamVideoSample.id);
    });
  });

  it('Will install event tracking when a video is loaded', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(uri, JSON.stringify(youtubeVideoSample));

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
});
