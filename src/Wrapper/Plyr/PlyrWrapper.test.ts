import Hls from 'hls.js';
import Plyr from 'plyr';
import { addListener } from 'resize-detector';
import { mocked } from 'ts-jest/utils';
import { Analytics } from '../../Events/Analytics';
import {
  PlaybackFactory,
  VideoFactory,
} from '../../test-support/TestFactories';
import { Wrapper } from '../Wrapper';
import PlyrWrapper from './PlyrWrapper';
import {defaultOptions, WrapperOptions} from '../WrapperOptions';

jest.mock('../../Events/Analytics');
jest.mock('resize-detector');

const video = VideoFactory.sample();

let container: HTMLElement = null;
let wrapper: Wrapper = null;
let tracker: Analytics = null;

beforeEach(() => {
  Hls.mockClear();
  Plyr.mockClear();

  container = document.createElement('div');
  tracker = new Analytics('player123');
  wrapper = new PlyrWrapper(container, tracker);
});

it('Constructs a Plyr given an element a video element within container', () => {
  expect(container.children.length).toEqual(1);

  const videoElement = container.children.item(0);
  expect(videoElement.tagName).toEqual('VIDEO');
  expect(videoElement.getAttribute('data-qa')).toEqual('boclips-player');

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

    it('instantiates a Hls', () => {
      expect(Hls).toHaveBeenCalled();
    });

    it('configures HLS to not autoload', () => {
      expect(Hls).toHaveBeenCalledWith(expect.objectContaining({autoStartLoad: false}))
    })

    it('attaches a new hls.js if supported when source is changed', () => {
      const hlsMockInstance = Hls.mock.instances[0];
      expect(hlsMockInstance.attachMedia).toHaveBeenCalled();
    });

    it('loads source once media is attached', () => {
      const hlsMockInstance = Hls.mock.instances[0];
      const [event, callback] = hlsMockInstance.on.mock.calls[0];

      expect(event).toEqual(Hls.Events.MEDIA_ATTACHED);
      callback();
      expect(hlsMockInstance.loadSource).toHaveBeenCalled();
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
      Hls.isSupported.mockReturnValue(false);
      wrapper.configureWithVideo(video);
    });

    it('does not instantiate a Hls', () => {
      expect(Hls).not.toHaveBeenCalled();
    });

    it('adds an loadedmetadata listener to the video which then plays', () => {
      const plyrInstance = Plyr.mock.instances[0];
      expect(plyrInstance.media.addEventListener).toHaveBeenCalledWith(
        'loadedmetadata',
        expect.anything(),
      );

      const callback = plyrInstance.media.addEventListener.mock.calls[0][1];

      callback();

      expect(plyrInstance.play).toHaveBeenCalled();
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
  const plyrInstance = Plyr.mock.instances[0];
  expect(plyrInstance.play).toHaveBeenCalled();
});

it('Will pause', () => {
  wrapper.configureWithVideo(video);

  wrapper.play();
  const plyrInstance = Plyr.mock.instances[0];
  expect(plyrInstance.play).toHaveBeenCalled();
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

    expect(tracker.handlePlay).toHaveBeenCalledWith(10);
  });

  it('will add an on pause event listener that delegates to the Analytics', () => {
    plyrInstance.__callEventCallback('pause', {
      detail: {
        plyr: {
          currentTime: 15,
        },
      },
    });

    expect(tracker.handlePause).toHaveBeenCalledWith(15);
  });

  it('will call on pause when the navigation is about to change', () => {
    const callbacks = (window as any).__callbacks.beforeunload;

    expect(callbacks).toHaveLength(1);

    plyrInstance.currentTime = 25;

    const callback = callbacks[0];

    callback();

    expect(tracker.handlePause).toHaveBeenCalledWith(25);
  });
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
  it('calls destroy on Hls', () => {
    Hls.isSupported.mockReturnValue(true);
    wrapper.configureWithVideo(
      VideoFactory.sample(PlaybackFactory.streamSample()),
    );

    wrapper.destroy();
    const hlsMockInstance = Hls.mock.instances[0];

    expect(hlsMockInstance.destroy).toHaveBeenCalled();
  });
});

describe('option configuration', () => {
  it('will use default controls if omitted', () => {
    expect(Plyr).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        controls: defaultOptions.controls,
      }),
    );
  });

  it('will pass through the control options', () => {
    const options: WrapperOptions = {
      controls: [
          "play-large"
      ]
    }
    new PlyrWrapper(container, tracker, options);
    const actualOptions = mocked(Plyr).mock.calls[1][1];
    expect(actualOptions.controls).toEqual(options.controls)
  })
});
