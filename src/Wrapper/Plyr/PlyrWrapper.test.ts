import Hls from 'hls.js';
import Plyr from 'plyr';
import { addListener } from 'resize-detector';
import { mocked } from 'ts-jest/utils';
import { EventTracker } from '../../Analytics/EventTracker';
import { VideoFactory } from '../../test-support/TestFactories';
import { Wrapper } from '../Wrapper';
import PlyrWrapper from './PlyrWrapper';

jest.mock('../../Analytics/EventTracker');
jest.mock('resize-detector');

const video = VideoFactory.sample();

let container: HTMLElement = null;
let wrapper: Wrapper = null;
let tracker: EventTracker = null;

beforeEach(() => {
  Hls.mockClear();
  Plyr.mockClear();

  container = document.createElement('div');
  tracker = new EventTracker('player123');
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
  describe('When Hls is supported', () => {
    beforeEach(() => {
      Hls.isSupported.mockReturnValue(true);

      wrapper.configureWithVideo(video);
    });

    it('instantiates a Hls', () => {
      expect(Hls).toHaveBeenCalled();
    });

    it('attaches a new hls.js if supported when source is changed', () => {
      expect(Hls).toHaveBeenCalled();
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
  });

  describe('When Hls is not supported', () => {
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

  it('will add an on playing event listener that delegates to the EventTracker', () => {
    plyrInstance.__callEventCallback('playing', {
      detail: {
        plyr: {
          currentTime: 10,
        },
      },
    });

    expect(tracker.handlePlay).toHaveBeenCalledWith(10);
  });

  it('will add an on pause event listener that delegates to the EventTracker', () => {
    plyrInstance.__callEventCallback('pause', {
      detail: {
        plyr: {
          currentTime: 15,
        },
      },
    });

    expect(tracker.handlePause).toHaveBeenCalledWith(15);
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
