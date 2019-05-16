import MockFetchVerify from '../test-support/MockFetchVerify';
import { MockWrapper } from '../test-support/MockWrapper';
import {
  streamVideoSample,
  youtubeVideoSample,
} from '../test-support/video-service-responses';
import { isStreamPlayback, StreamPlayback } from '../types/Playback';
import { WrapperConstructor } from '../Wrapper/Wrapper';
import { BoclipsPlayer } from './BoclipsPlayer';

jest.mock('../Analytics/EventTracker', () => {
  return {
    EventTracker: jest.fn().mockImplementation(() => {
      return {
        configure: jest.fn(),
      };
    }),
  };
});

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
    expect(wrapperConstructor).toHaveBeenCalledWith(container);
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

  it('Will play the streamUrl in the playback object', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(uri, JSON.stringify(streamVideoSample));

    return player.loadVideo(uri).then(() => {
      expect(player.getWrapper().source.sources[0].src).toContain(
        'kaltura/stream.mp4',
      );
    });
  });

  it('Will play the youtube id in the playback object', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(uri, JSON.stringify(youtubeVideoSample));

    return player.loadVideo(uri).then(() => {
      expect(player.getWrapper().source.sources[0].src).toContain(
        'youtube-playback-id',
      );
    });
  });

  it('Will install event tracking when a video is loaded', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(uri, JSON.stringify(youtubeVideoSample));

    return player.loadVideo(uri).then(() => {
      const eventTracker = player.getEventTracker();

      expect(eventTracker.configure).toHaveBeenCalled();
    });
  });

  it('Will configure the event tracking into the wrapper when a video is loaded', () => {
    const uri = '/v1/videos/177';

    MockFetchVerify.get(uri, JSON.stringify(youtubeVideoSample));

    return player.loadVideo(uri).then(() => {
      const wrapper = player.getWrapper();

      expect(wrapper.installEventTracker).toHaveBeenCalled();
    });
  });
});
