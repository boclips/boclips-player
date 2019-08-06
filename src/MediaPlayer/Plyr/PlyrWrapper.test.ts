import Plyr from 'plyr';
import { MaybeMocked } from 'ts-jest/dist/util/testing';
import { mocked } from 'ts-jest/utils';
import {
  BoclipsPlayer,
  PrivatePlayer,
} from '../../BoclipsPlayer/BoclipsPlayer';
import { StreamingTechnique } from '../../StreamingTechnique/StreamingTechnique';
import { StreamingTechniqueFactory } from '../../StreamingTechnique/StreamingTechniqueFactory';
import {
  PlaybackFactory,
  VideoFactory,
} from '../../test-support/TestFactories';
import { MediaPlayer } from '../MediaPlayer';
import PlyrWrapper from './PlyrWrapper';

jest.mock('../../BoclipsPlayer/BoclipsPlayer');
jest.mock('../../Events/Analytics');
jest.mock('../../ErrorHandler/ErrorHandler');
jest.mock('../../StreamingTechnique/StreamingTechniqueFactory');

const video = VideoFactory.sample();

let container: HTMLElement = null;
let mockPlayer: MaybeMocked<PrivatePlayer> | PrivatePlayer;
let mediaPlayer: MediaPlayer = null;
let mockPlyr;

function getLatestMockPlyr() {
  return Plyr.mock.instances[Plyr.mock.instances.length - 1];
}

beforeEach(() => {
  Plyr.mockClear();

  container = document.createElement('div');

  mockPlayer = mocked(new BoclipsPlayer(container));
  mediaPlayer = new PlyrWrapper(mockPlayer);

  mockPlyr = getLatestMockPlyr();
});

describe('Instantiation', () => {
  it('Plyr is configured according to the Player options', () => {
    mockPlayer = new BoclipsPlayer(container, {
      interface: { controls: ['play-large'] },
    });

    mediaPlayer = new PlyrWrapper(mockPlayer);

    const actualOptions = mocked(Plyr).mock.calls[1][1];
    expect(actualOptions.controls).toEqual(['play-large']);
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
});

describe('Stream Playback', () => {
  let mockStreamingTechnique: MaybeMocked<StreamingTechnique> = null;

  beforeEach(() => {
    mockStreamingTechnique = mocked(StreamingTechniqueFactory.get(mockPlayer));
  });

  it('initialises the streamingTechnique', () => {
    mediaPlayer.configureWithVideo(video);

    expect(mockStreamingTechnique.initialise).toHaveBeenCalledWith(
      video.playback,
      undefined,
    );
  });

  it('adds a play listener to Plyr to startLoad on the streamingTechnique', () => {
    mediaPlayer.configureWithVideo(video);

    mockPlyr = getLatestMockPlyr();
    mockPlyr.currentTime = 20;
    mockPlyr.__callEventCallback('play');

    expect(mockStreamingTechnique.startLoad).toHaveBeenCalledWith(20);
  });

  it('destroys the streamingTechnique before loading another video', () => {
    mediaPlayer.configureWithVideo(video);

    mediaPlayer.configureWithVideo(
      VideoFactory.sample(PlaybackFactory.youtubeSample()),
    );

    expect(mockStreamingTechnique.destroy).toHaveBeenCalled();
  });

  describe('with a playback segment', () => {
    it('does not restrict streamingTechnique load when there is no start time', () => {
      const segment = {
        end: 60,
      };

      mediaPlayer.configureWithVideo(video, segment);

      expect(mockStreamingTechnique.initialise).toHaveBeenCalledWith(
        video.playback,
        undefined,
      );

      mockPlyr = getLatestMockPlyr();
      mockPlyr.__callEventCallback('play');

      expect(mockStreamingTechnique.startLoad).toHaveBeenCalledWith(undefined);
    });

    it('restricts the initial streamingTechnique load when a playback segment is provided', () => {
      const segment = {
        start: 30,
        end: 60,
      };

      mediaPlayer.configureWithVideo(VideoFactory.sample(), segment);

      expect(mockStreamingTechnique.initialise).toHaveBeenCalledWith(
        video.playback,
        segment.start,
      );

      mockPlyr = getLatestMockPlyr();
      mockPlyr.__callEventCallback('play');

      expect(mockStreamingTechnique.startLoad).toHaveBeenCalledWith(
        segment.start,
      );
    });

    it('stops streamingTechnique from loading when it is automatically paused', () => {
      const segment = {
        start: 30,
        end: 60,
      };

      mediaPlayer.configureWithVideo(VideoFactory.sample(), segment);

      mockPlyr = getLatestMockPlyr();
      mockPlyr.currentTime = 60;
      mockPlyr.__callEventCallback('timeupdate');

      expect(mockStreamingTechnique.stopLoad).toHaveBeenCalled();
    });
  });
});

describe('YouTube Playback', () => {
  it('does not get a StreamingTechnique', () => {
    mediaPlayer.configureWithVideo(
      VideoFactory.sample(PlaybackFactory.youtubeSample()),
    );

    expect(StreamingTechniqueFactory.get).not.toHaveBeenCalled();
  });
});

describe('Playback restriction', () => {
  const testData = [
    { type: 'Stream', segmentedVideo: VideoFactory.sample() },
    {
      type: 'Youtube',
      segmentedVideo: VideoFactory.sample(PlaybackFactory.youtubeSample()),
    },
  ];

  testData.forEach(({ type, segmentedVideo }) =>
    describe('For ' + type, () => {
      it('should set the currentTime at the beginning of the segment', () => {
        const segment = {
          start: 30,
        };

        mediaPlayer.configureWithVideo(segmentedVideo, segment);

        mockPlyr = getLatestMockPlyr();
        expect(mockPlyr.currentTime).toEqual(segment.start);
      });

      it('should add a playing event to set seek to the beginning of the segment', () => {
        const segment = {
          start: 30,
        };

        mediaPlayer.configureWithVideo(segmentedVideo, segment);

        mockPlyr = getLatestMockPlyr();
        // Some browsers won't set currentTime if it hasn't loaded the data
        mockPlyr.currentTime = 0;

        mockPlyr.__callEventCallback('playing');

        expect(mockPlyr.currentTime).toEqual(segment.start);
      });

      it('should pause playback at the end of the segment', () => {
        const segment = {
          end: 60,
        };

        mediaPlayer.configureWithVideo(segmentedVideo, segment);

        mockPlyr = getLatestMockPlyr();
        mockPlyr.currentTime = 60;
        mockPlyr.__callEventCallback('timeupdate');

        expect(mockPlyr.pause).toHaveBeenCalled();
      });

      it('should not auto pause again after it has paused once', () => {
        const segment = {
          end: 60,
        };

        mediaPlayer.configureWithVideo(segmentedVideo, segment);

        mockPlyr = getLatestMockPlyr();
        mockPlyr.currentTime = 60;
        mockPlyr.__callEventCallback('timeupdate');

        expect(mockPlyr.pause).toBeCalledTimes(1);

        mockPlyr.currentTime = 65;
        mockPlyr.__callEventCallback('timeupdate');

        expect(mockPlyr.pause).toBeCalledTimes(1);
      });

      it('should not pause if the segment end is earlier than the start', () => {
        const segment = {
          start: 45,
          end: 20,
        };

        mediaPlayer.configureWithVideo(segmentedVideo, segment);

        mockPlyr = getLatestMockPlyr();

        expect(mockPlyr.on).not.toHaveBeenCalledWith(
          'timeupdate',
          expect.anything(),
        );
      });

      it('should not apply segment limits when video is changed', () => {
        const segment = {
          start: 30,
          end: 60,
        };

        mediaPlayer.configureWithVideo(segmentedVideo, segment);

        mockPlyr = getLatestMockPlyr();
        expect(mockPlyr.currentTime).toEqual(30);

        mockPlyr.currentTime = 60;
        mockPlyr.__callEventCallback('timeupdate');

        expect(mockPlyr.pause).toHaveBeenCalledTimes(1);

        mediaPlayer.configureWithVideo(
          VideoFactory.sample(PlaybackFactory.youtubeSample()),
        );

        mockPlyr = getLatestMockPlyr();

        expect(mockPlyr.currentTime).toBeUndefined();

        mockPlyr.currentTime = 60;
        mockPlyr.__callEventCallback('timeupdate');

        expect(mockPlyr.pause).not.toHaveBeenCalled();
      });
    }),
  );
});

describe('Passthrough API', () => {
  it('Will play', () => {
    mediaPlayer.configureWithVideo(video);

    mediaPlayer.play();
    mockPlyr = getLatestMockPlyr();
    expect(mockPlyr.play).toHaveBeenCalled();
  });

  it('Will pause', () => {
    mediaPlayer.configureWithVideo(video);

    mediaPlayer.pause();
    mockPlyr = getLatestMockPlyr();
    expect(mockPlyr.pause).toHaveBeenCalled();
  });
});

describe('Playback Tracking', () => {
  it('will add an on playing event listener that delegates to the Analytics', () => {
    mockPlyr.currentTime = 10;
    mockPlyr.__callEventCallback('playing', {
      detail: {
        plyr: mockPlyr,
      },
    });

    expect(mockPlayer.getAnalytics().handlePlay).toHaveBeenCalledWith(10);
  });

  it('will add an on pause event listener that delegates to the Analytics', () => {
    mockPlyr.currentTime = 15;
    mockPlyr.__callEventCallback('pause', {
      detail: {
        plyr: mockPlyr,
      },
    });

    expect(mockPlayer.getAnalytics().handlePause).toHaveBeenCalledWith(15);
  });

  it('will call on pause when the navigation is about to change', () => {
    const callbacks = (window as any).__callbacks.beforeunload;

    expect(callbacks).toHaveLength(1);

    mockPlyr.currentTime = 25;

    const callback = callbacks[0];

    callback();

    expect(mockPlayer.getAnalytics().handlePause).toHaveBeenCalledWith(25);
  });
});

describe('Interaction events', () => {
  it('Plyr entering fullscreen', () => {
    mockPlyr.currentTime = 124;
    mockPlyr.__callEventCallback('enterfullscreen');

    expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      124,
      'fullscreenEnabled',
      {},
    );
  });

  it('Plyr exiting fullscreen', () => {
    mockPlyr.currentTime = 127;

    mockPlyr.__callEventCallback('exitfullscreen');

    expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      127,
      'fullscreenDisabled',
      {},
    );
  });

  it.skip('Captions are turned on', () => {
    mockPlyr.currentTime = 124;
    mockPlyr.captions = {
      currentTrackNode: {
        kind: 'Captions',
        label: 'English',
        language: 'en',
        id: '',
      },
    };

    mockPlyr.__callEventCallback('captionsenabled');

    expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      124,
      'captionsEnabled',
      {
        kind: 'Captions',
        label: 'English',
        language: 'en',
        id: '',
      },
    );
  });

  it.skip('Captions change language', () => {
    mockPlyr.currentTime = 124;
    mockPlyr.captions = {
      currentTrackNode: {
        kind: 'Captions',
        label: 'Dutch',
        language: 'nl',
        id: '123',
      },
    };

    mockPlyr.__callEventCallback('languagechange');

    expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      125,
      'captionsChanged',
      {
        kind: 'Captions',
        label: 'Dutch',
        language: 'nl',
        id: '123',
      },
    );
  });

  it.skip('Captions are turned off', () => {
    mockPlyr.currentTime = 125;

    mockPlyr.__callEventCallback('captionsdisabled');

    expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      125,
      'captionsDisabled',
      {},
    );
  });

  it('Speed of the playback changes', () => {
    mockPlyr.currentTime = 125;
    mockPlyr.speed = 1.25;

    mockPlyr.__callEventCallback('ratechange');

    expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      125,
      'speedChanged',
      {
        speed: 1.25,
      },
    );
  });
});

describe('UI Events', () => {
  it('adds a --fullscreen class to the container on enterfullscreen', () => {
    expect(container.classList).not.toContain('plyr--fullscreen');

    mockPlyr.__callEventCallback('enterfullscreen');

    expect(container.classList).toContain('plyr--fullscreen');
  });

  it('removes a --fullscreen class to the container on exitfullscreen', () => {
    container.classList.add('plyr--fullscreen');

    mockPlyr.__callEventCallback('exitfullscreen');

    expect(container.classList).not.toContain('plyr--fullscreen');
  });
});

describe('Destruction', () => {
  let mockStreamingTechnique: MaybeMocked<StreamingTechnique> = null;

  beforeEach(() => {
    mockStreamingTechnique = mocked(StreamingTechniqueFactory.get(mockPlayer));
  });

  it('destroys the Plyr instance', () => {
    mediaPlayer.destroy();

    expect(mockPlyr.destroy).toHaveBeenCalled();
  });

  it('catches exceptions from Plyr destruction', () => {
    mockPlyr.destroy.mockImplementation(() => {
      throw Error('This should not bubble');
    });

    expect(() => {
      mediaPlayer.destroy();
    }).not.toThrow();
  });

  it('destroys the streamingTechnique', () => {
    mediaPlayer.configureWithVideo(
      VideoFactory.sample(PlaybackFactory.streamSample()),
    );

    mediaPlayer.destroy();

    expect(mockStreamingTechnique.destroy).toHaveBeenCalled();
  });

  it('catches exceptions from streamingTechnique destruction', () => {
    mediaPlayer.configureWithVideo(
      VideoFactory.sample(PlaybackFactory.streamSample()),
    );

    mockStreamingTechnique.destroy.mockImplementation(() => {
      throw Error('This should not bubble');
    });

    expect(() => {
      mediaPlayer.destroy();
    }).not.toThrow();
  });

  it('sends a pause event', () => {
    mockPlyr.currentTime = 50;

    mediaPlayer.destroy();

    expect(mockPlayer.getAnalytics().handlePause).toHaveBeenCalledWith(50);
  });

  it('does not configure video once the Plyr has been destroyed', () => {
    const sourceSetSpy = jest.fn();
    Object.defineProperty(mockPlyr, 'source', {
      set: sourceSetSpy,
    });

    mediaPlayer.destroy();

    mediaPlayer.configureWithVideo(VideoFactory.sample());

    expect(sourceSetSpy).not.toHaveBeenCalled();
  });

  it('will remove an unload event listener on destruction', () => {
    expect((window as any).__callbacks.beforeunload).toHaveLength(1);

    mockPlyr.currentTime = 15;

    mediaPlayer.destroy();

    expect(mockPlayer.getAnalytics().handlePause).toHaveBeenCalledWith(15);

    expect((window as any).__callbacks.beforeunload).toHaveLength(0);
  });
});
