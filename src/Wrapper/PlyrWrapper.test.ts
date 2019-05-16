import Hls from 'hls.js';
import Plyr from 'plyr';
import { EventTracker } from '../Analytics/EventTracker';
import { SourceFactory } from '../test-support/TestFactories';
import PlyrWrapper from './PlyrWrapper';
import Mock = jest.Mock;

jest.mock('../Analytics/EventTracker');

let container = null;
let wrapper = null;

beforeEach(() => {
  Hls.mockClear();
  Plyr.mockClear();

  container = document.createElement('video');
  container.setAttribute('data-plyr-wrapper', 'html5');
  wrapper = new PlyrWrapper(container);
});

it('Constructs a Plyr given an element a video element within container', () => {
  expect(container.children.length).toEqual(1);
  const video = container.children.item(0);
  expect(video.tagName).toEqual('VIDEO');
  expect(video.getAttribute('data-qa')).toEqual('boclips-player');

  expect(Plyr).toHaveBeenCalledWith(video, expect.anything());
});

describe('When a new source is set', () => {
  describe('When Hls is supported', () => {
    beforeEach(() => {
      Hls.isSupported.mockReturnValue(true);

      wrapper.source = SourceFactory.sample();
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
      wrapper.source = SourceFactory.sample();
    });

    it('does not instantiate a Hls', () => {
      expect(Hls).not.toHaveBeenCalled();
    });
  });
});

it('Will play', () => {
  wrapper.source = SourceFactory.sample();

  wrapper.play();
  const plyrInstance = Plyr.mock.instances[0];
  expect(plyrInstance.play).toHaveBeenCalled();
});

it('Will pause', () => {
  wrapper.source = SourceFactory.sample();

  wrapper.play();
  const plyrInstance = Plyr.mock.instances[0];
  expect(plyrInstance.play).toHaveBeenCalled();
});

describe('When installing an Event Tracker', () => {
  let mockTracker;
  let plyrInstance;

  beforeEach(() => {
    (EventTracker as Mock).mockImplementation(() => {
      return {
        handlePlay: jest.fn(),
        handlePause: jest.fn(),
      };
    });

    mockTracker = new EventTracker('testing-123');
    plyrInstance = Plyr.mock.instances[0];
    plyrInstance.on.mockClear();
  });

  it('will add an on playing event listener that delegates to the EventTracker', () => {
    wrapper.installEventTracker(mockTracker);

    const calls = plyrInstance.on.mock.calls.filter(
      ([name]) => name === 'playing',
    );
    expect(calls).toHaveLength(1);

    const callback = calls[0][1];

    plyrInstance.currentTime = 10;
    callback({
      detail: {
        plyr: plyrInstance,
      },
    });
    expect(mockTracker.handlePlay).toHaveBeenCalledWith(10);
  });

  it('will add an on pause event listener that delegates to the EventTracker', () => {
    wrapper.installEventTracker(mockTracker);

    const calls = plyrInstance.on.mock.calls.filter(
      ([name]) => name === 'pause',
    );

    expect(calls).toHaveLength(1);
    const callback = calls[0][1];

    plyrInstance.currentTime = 15;
    callback({
      detail: {
        plyr: plyrInstance,
      },
    });
    expect(mockTracker.handlePause).toHaveBeenCalledWith(15);
  });
});
