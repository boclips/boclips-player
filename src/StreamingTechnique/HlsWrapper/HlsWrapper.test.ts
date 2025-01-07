import Hls from 'hls.js';
import { BoclipsPlayer } from '../../BoclipsPlayer/BoclipsPlayer';
import { PlaybackFactory } from '../../test-support/TestFactories';
import { StreamingTechnique } from '../StreamingTechnique';
import { HlsWrapper } from './HlsWrapper';

jest.mock('../../BoclipsPlayer/BoclipsPlayer');
jest.mock('../../ErrorHandler/ErrorHandler');
jest.mock('hls.js');

const streamPlayback = PlaybackFactory.streamSample();

let player = null;
let hlsTechnique: StreamingTechnique = null;

beforeEach(() => {
  const container = document.createElement('div');
  player = new BoclipsPlayer(container);
  hlsTechnique = new HlsWrapper(player);
});

describe('initialisation', () => {
  it('destroys HLS if already initialised before reinstantiating', () => {
    hlsTechnique.initialise(streamPlayback, -1);
    hlsTechnique.initialise(streamPlayback, -1);

    expect(Hls).toHaveBeenCalledTimes(2);
    // @ts-ignore
    expect(Hls.mock.instances[0].destroy).toHaveBeenCalled();
  });

  it('instantiates a Hls without a segment start', () => {
    hlsTechnique.initialise(streamPlayback, -1);

    expect(Hls).toHaveBeenCalledWith(
      expect.objectContaining({
        startPosition: -1,
      }),
    );
  });

  it('instantiates a Hls with a segment start', () => {
    hlsTechnique.initialise(streamPlayback, 55);

    expect(Hls).toHaveBeenCalledWith(
      expect.objectContaining({
        startPosition: 55,
      }),
    );
  });

  it('configures HLS to not autoload', () => {
    hlsTechnique.initialise(streamPlayback, -1);

    expect(Hls).toHaveBeenCalledWith(
      expect.objectContaining({ autoStartLoad: false }),
    );
  });

  it('attaches a new hls.js if supported', () => {
    hlsTechnique.initialise(streamPlayback, -1);

    // @ts-ignore
    const hlsMockInstance = Hls.mock.instances[0];
    expect(hlsMockInstance.attachMedia).toHaveBeenCalled();
  });

  it('loads the playback url when attached', () => {
    hlsTechnique.initialise(streamPlayback, -1);

    // @ts-ignore
    const hlsMockInstance = Hls.mock.instances[0];

    hlsMockInstance.__callEventCallback(Hls.Events.MEDIA_ATTACHED);

    expect(hlsMockInstance.loadSource).toHaveBeenCalledWith(
      streamPlayback.links.hlsStream.getOriginalLink(),
    );
  });

  describe('Start Load', () => {
    it('does not throw an exception if HLS is not initialised', () => {
      expect(() => {
        hlsTechnique.startLoad(3);
      }).not.toThrow();
    });

    it('does not start loading if it has been destroyed', () => {
      hlsTechnique.initialise(streamPlayback, -1);
      hlsTechnique.destroy();
      hlsTechnique.startLoad(4);
      // @ts-ignore

      const hlsMockInstance = Hls.mock.instances[0];
      expect(hlsMockInstance.startLoad).not.toHaveBeenCalled();
    });

    it('will start loading at the point given point', () => {
      hlsTechnique.initialise(streamPlayback, -1);

      hlsTechnique.startLoad(4);
      // @ts-ignore
      const hlsMockInstance = Hls.mock.instances[0];
      expect(hlsMockInstance.startLoad).toHaveBeenCalledWith(4);
    });
  });

  describe('Stop Load', () => {
    it('does not throw an exception if HLS is not initialised', () => {
      expect(() => {
        hlsTechnique.stopLoad();
      }).not.toThrow();
    });

    it('does not stop loading if it has been destroyed', () => {
      hlsTechnique.initialise(streamPlayback, -1);
      hlsTechnique.destroy();
      hlsTechnique.stopLoad();

      // @ts-ignore
      const hlsMockInstance = Hls.mock.instances[0];
      expect(hlsMockInstance.stopLoad).not.toHaveBeenCalled();
    });

    it('will stop loading', () => {
      hlsTechnique.initialise(streamPlayback, -1);

      hlsTechnique.stopLoad();
      // @ts-ignore
      const hlsMockInstance = Hls.mock.instances[0];
      expect(hlsMockInstance.stopLoad).toHaveBeenCalled();
    });
  });

  describe('Destruction', () => {
    it('does not throw an exception if HLS is not initialised', () => {
      expect(() => {
        hlsTechnique.destroy();
      }).not.toThrow();
    });

    it('will destroy the HLS instance', () => {
      hlsTechnique.initialise(streamPlayback, -1);
      hlsTechnique.destroy();
      // @ts-ignore
      const hlsMockInstance = Hls.mock.instances[0];
      expect(hlsMockInstance.destroy).toHaveBeenCalled();
    });

    it('will only destroy the HLS instance once', () => {
      hlsTechnique.initialise(streamPlayback, -1);
      hlsTechnique.destroy();
      hlsTechnique.destroy();
      // @ts-ignore
      const hlsMockInstance = Hls.mock.instances[0];
      expect(hlsMockInstance.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('gracefully handles non-fatal errors', () => {
      hlsTechnique.initialise(streamPlayback, -1);
      // @ts-ignore
      const hlsMockInstance = Hls.mock.instances[0];

      expect(() => {
        hlsMockInstance.__callEventCallback(Hls.Events.ERROR, {
          type: 'any type',
          details: 'any details',
          fatal: false,
        });
      }).not.toThrow();
    });

    describe('manifest errors', () => {
      const manifestErrors = [
        Hls.ErrorDetails.MANIFEST_LOAD_ERROR,
        Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT,
        Hls.ErrorDetails.MANIFEST_PARSING_ERROR,
      ];

      manifestErrors.forEach((errorDetails) => {
        it(`tries to reload the source when an ${errorDetails} occurs`, () => {
          hlsTechnique.initialise(streamPlayback, -1);

          const hlsMockInstance =
            // @ts-ignore
            Hls.mock.instances[Hls.mock.instances.length - 1];

          triggerError(errorDetails);

          expect(hlsMockInstance.loadSource).toHaveBeenCalledTimes(1);
          expect(hlsMockInstance.loadSource).toHaveBeenCalledWith(
            streamPlayback.links.hlsStream.getOriginalLink(),
          );
        });

        it(`render an error when a ${errorDetails} occurs three times`, () => {
          const errorHandler = player.getErrorHandler();

          hlsTechnique.initialise(streamPlayback, -1);

          const hlsMockInstance =
            // @ts-ignore
            Hls.mock.instances[Hls.mock.instances.length - 1];

          triggerError(errorDetails);

          expect(hlsMockInstance.destroy).not.toHaveBeenCalled();
          expect(errorHandler.handleError).not.toHaveBeenCalled();

          triggerError(errorDetails);

          expect(hlsMockInstance.destroy).not.toHaveBeenCalled();
          expect(errorHandler.handleError).not.toHaveBeenCalled();

          triggerError(errorDetails);

          expect(hlsMockInstance.destroy).toHaveBeenCalled();
          expect(errorHandler.handleError).toHaveBeenCalled();
        });
      });

      function triggerError(details) {
        try {
          const hlsMockInstance =
            // @ts-ignore
            Hls.mock.instances[Hls.mock.instances.length - 1];

          hlsMockInstance.__callEventCallback(Hls.Events.ERROR, {
            type: Hls.ErrorTypes.NETWORK_ERROR,
            details,
            fatal: true,
          });
        } catch (_) {}
      }
    });
  });
});
