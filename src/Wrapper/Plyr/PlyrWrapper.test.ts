import Hls from 'hls.js';
import Plyr from 'plyr';
import { mocked } from 'ts-jest/utils';
import {
  BoclipsPlayer,
  PrivatePlayer,
} from '../../BoclipsPlayer/BoclipsPlayer';
import { MockWrapper } from '../../test-support/MockWrapper';
import {
  PlaybackFactory,
  VideoFactory,
} from '../../test-support/TestFactories';
import { StreamPlayback } from '../../types/Playback';
import { Wrapper } from '../Wrapper';
import PlyrWrapper from './PlyrWrapper';

jest.mock('../../BoclipsPlayer/BoclipsPlayer');
jest.mock('../../Events/Analytics');

const video = VideoFactory.sample();

let container: HTMLElement = null;
let player: PrivatePlayer;
let wrapper: Wrapper = null;

beforeEach(() => {
  Hls.mockClear();
  Plyr.mockClear();

  container = document.createElement('div');
  player = new BoclipsPlayer(MockWrapper, container);
  wrapper = new PlyrWrapper(player);
});

it('Constructs a Plyr given an element a video element within container', () => {
  expect(container.children.length).toEqual(1);

  const videoElement = container.children.item(0);
  expect(videoElement.tagName).toEqual('VIDEO');
  expect(videoElement.getAttribute('data-qa')).toEqual('boclips-player');
  expect(videoElement.getAttribute('preload')).toEqual('metadata');

  expect(Plyr).toHaveBeenCalledWith(
    videoElement,
    expect.objectContaining({
      captions: expect.objectContaining({ update: true }),
    }),
  );
});

describe('When a new video is configured', () => {
  describe('With a STREAM video when Hls is supported', () => {
    beforeEach(() => {
      Hls.isSupported.mockReturnValue(true);

      wrapper.configureWithVideo(video);
    });

    it('does not instantiate Hls if there is no playback', () => {
      Hls.mockClear();
      // tslint:disable-next-line:no-unused-expression
      new PlyrWrapper(player);
      expect(Hls).not.toHaveBeenCalled();
    });

    it('instantiates a Hls', () => {
      expect(Hls).toHaveBeenCalled();
    });

    it('configures HLS to not autoload', () => {
      expect(Hls).toHaveBeenCalledWith(
        expect.objectContaining({ autoStartLoad: false }),
      );
    });

    it('attaches a new hls.js if supported', () => {
      const hlsMockInstance = Hls.mock.instances[0];
      expect(hlsMockInstance.attachMedia).toHaveBeenCalled();
    });

    it('loads the playback url when attached', () => {
      const hlsMockInstance = Hls.mock.instances[0];
      const [event, callback] = mocked(hlsMockInstance.on).mock.calls[0];

      expect(event).toEqual(Hls.Events.MEDIA_ATTACHED);
      expect(callback).toBeTruthy();

      callback();

      expect(hlsMockInstance.loadSource).toHaveBeenCalledWith(
        (video.playback as StreamPlayback).streamUrl,
      );
    });

    it('destroys HLS before loading another video', () => {
      wrapper.configureWithVideo(
        VideoFactory.sample(PlaybackFactory.youtubeSample()),
      );
      const hlsMockInstance = Hls.mock.instances[0];
      expect(hlsMockInstance.destroy).toHaveBeenCalled();
    });
  });

  describe('When Hls is not supported with STREAM', () => {
    beforeEach(() => {
      Hls.mockClear();
      Hls.isSupported.mockReturnValue(false);
      wrapper.configureWithVideo(video);
    });

    it('does not instantiate a Hls', () => {
      expect(Hls).not.toHaveBeenCalled();
    });
  });

  describe('When Hls is supported with YOUTUBE', () => {
    beforeEach(() => {
      Hls.isSupported.mockReturnValue(true);
      wrapper.configureWithVideo(
        VideoFactory.sample(PlaybackFactory.youtubeSample()),
      );
    });

    it('does not instantiate a Hls', () => {
      expect(Hls).not.toHaveBeenCalled();
    });

    it('does not add an loadedmetadata listener', () => {
      const plyrInstance = Plyr.mock.instances[0];
      expect(plyrInstance.media.addEventListener).not.toHaveBeenCalledWith(
        'loadedmetadata',
        expect.anything(),
      );
    });
  });
});

it('Will play', () => {
  wrapper.configureWithVideo(video);

  wrapper.play();
  const plyrInstance = Plyr.mock.instances[1];
  expect(plyrInstance.play).toHaveBeenCalled();
});

it('Will pause', () => {
  wrapper.configureWithVideo(video);

  wrapper.pause();
  const plyrInstance = Plyr.mock.instances[1];
  expect(plyrInstance.pause).toHaveBeenCalled();
});

describe('Event Tracking', () => {
  let plyrInstance;

  beforeEach(() => {
    plyrInstance = Plyr.mock.instances[0];
    plyrInstance.on.mockClear();
  });

  it('will add an on playing event listener that delegates to the Analytics', () => {
    plyrInstance.__callEventCallback('playing', {
      detail: {
        plyr: {
          currentTime: 10,
        },
      },
    });

    expect(player.getAnalytics().handlePlay).toHaveBeenCalledWith(10);
  });

  it('will add an on pause event listener that delegates to the Analytics', () => {
    plyrInstance.__callEventCallback('pause', {
      detail: {
        plyr: {
          currentTime: 15,
        },
      },
    });

    expect(player.getAnalytics().handlePause).toHaveBeenCalledWith(15);
  });

  it('will call on pause when the navigation is about to change', () => {
    const callbacks = (window as any).__callbacks.beforeunload;

    expect(callbacks).toHaveLength(1);

    plyrInstance.currentTime = 25;

    const callback = callbacks[0];

    callback();

    expect(player.getAnalytics().handlePause).toHaveBeenCalledWith(25);
  });

  it('will remove an unload event listener on destruction', () => {
    expect((window as any).__callbacks.beforeunload).toHaveLength(1);

    plyrInstance.currentTime = 15;

    wrapper.destroy();

    expect(player.getAnalytics().handlePause).toHaveBeenCalledWith(15);

    expect((window as any).__callbacks.beforeunload).toHaveLength(0);
  });
});

describe('is listening for plyr events', () => {
  let plyrInstance;

  beforeEach(() => {
    plyrInstance = Plyr.mock.instances[0];
  });

  it('adds a --fullscreen class to the container on enterfullscreen', () => {
    expect(container.classList).not.toContain('plyr--fullscreen');
    plyrInstance.__callEventCallback('enterfullscreen');
    expect(container.classList).toContain('plyr--fullscreen');
  });

  it('removes a --fullscreen class to the container on exitfullscreen', () => {
    container.classList.add('plyr--fullscreen');
    plyrInstance.__callEventCallback('exitfullscreen');
    expect(container.classList).not.toContain('plyr--fullscreen');
  });
});

describe('when asked to destroy', () => {
  it('calls destroy on Plyr', () => {
    wrapper.destroy();
    const plyrInstance = Plyr.mock.instances[0];

    expect(plyrInstance.destroy).toHaveBeenCalled();
  });

  it('catches exceptions from the destroy function of plyr', () => {
    const plyrInstance = Plyr.mock.instances[0];
    plyrInstance.destroy.mockImplementation(() => {
      throw Error('This should not bubble');
    });

    expect(() => {
      wrapper.destroy();
    }).not.toThrow();
  });

  it('calls destroy on Hls', () => {
    Hls.isSupported.mockReturnValue(true);
    wrapper.configureWithVideo(
      VideoFactory.sample(PlaybackFactory.streamSample()),
    );

    wrapper.destroy();
    const hlsMockInstance = Hls.mock.instances[0];

    expect(hlsMockInstance.destroy).toHaveBeenCalled();
  });

  it('catches exceptions from the destroy function of hls', () => {
    Hls.isSupported.mockReturnValue(true);
    wrapper.configureWithVideo(
      VideoFactory.sample(PlaybackFactory.streamSample()),
    );

    const hlsMockInstance = Hls.mock.instances[0];
    hlsMockInstance.destroy.mockImplementation(() => {
      throw Error('This should not bubble');
    });

    expect(() => {
      wrapper.destroy();
    }).not.toThrow();
  });

  it('sends a pause event on destruction', () => {
    const plyrInstance = Plyr.mock.instances[0];
    plyrInstance.currentTime = 50;

    wrapper.destroy();

    expect(player.getAnalytics().handlePause).toHaveBeenCalledWith(50);
  });
});

describe('option configuration', () => {
  it('will pass through the control options', () => {
    player = new BoclipsPlayer(PlyrWrapper, container, {
      player: { controls: ['play-large'] },
    });

    wrapper = new PlyrWrapper(player);

    const actualOptions = mocked(Plyr).mock.calls[1][1];
    expect(actualOptions.controls).toEqual(['play-large']);
  });
});

it('does not configure video when the Plyr has been destroyed', () => {
  const plyrInstance = Plyr.mock.instances[0];
  const sourceSetSpy = jest.fn();
  Object.defineProperty(plyrInstance, 'source', {
    set: sourceSetSpy,
  });

  wrapper.destroy();

  wrapper.configureWithVideo(VideoFactory.sample());

  expect(sourceSetSpy).not.toHaveBeenCalled();
});
