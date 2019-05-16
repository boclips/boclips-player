import Hls from 'hls.js';
import Plyr from 'plyr';
import { SourceFactory } from '../test-support/TestFactories';
import PlyrWrapper from './PlyrWrapper';

let element = null;
let wrapper = null;

beforeEach(() => {
  Hls.mockClear();
  Plyr.mockClear();

  element = document.createElement('video');
  element.setAttribute('data-plyr-provider', 'html5');
  wrapper = new PlyrWrapper(element);
});

it('Constructs a Plyr given an element', () => {
  expect(Plyr).toHaveBeenCalledWith(element, expect.anything());
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
      const hlsMockInstance = Hls.mock.results[0].value;
      expect(hlsMockInstance.attachMedia).toHaveBeenCalled();
    });

    it('loads source once media is attached', () => {
      const hlsMockInstance = Hls.mock.results[0].value;
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
