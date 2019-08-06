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
import { Video } from '../../types/Video';
import { MediaPlayer } from '../MediaPlayer';
import PlyrWrapper from './PlyrWrapper';

jest.mock('../../BoclipsPlayer/BoclipsPlayer');
jest.mock('../../Events/Analytics');
jest.mock('../../ErrorHandler/ErrorHandler');
jest.mock('../../StreamingTechnique/StreamingTechniqueFactory');

const video = VideoFactory.sample();

let container: HTMLElement = null;
let player: PrivatePlayer;
let mediaPlayer: MediaPlayer = null;

beforeEach(() => {
  Plyr.mockClear();

  container = document.createElement('div');
  player = new BoclipsPlayer(container);
  mocked(player).getVideo.mockReturnValue({
    id: 'video-id-123',
  } as Video);
  mediaPlayer = new PlyrWrapper(player);
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
  describe('With Stream (Kaltura)', () => {
    let mockStreamingTechnique: MaybeMocked<StreamingTechnique> = null;

    beforeEach(() => {
      mockStreamingTechnique = mocked(StreamingTechniqueFactory.get(player));
    });

    it('it initialises the streamingTechnique', () => {
      mediaPlayer.configureWithVideo(video);

      expect(mockStreamingTechnique.initialise).toHaveBeenCalledWith(
        video.playback,
        undefined,
      );
    });

    it('adds a play listener to Plyr to startLoad on the streamingTechnique', () => {
      mediaPlayer.configureWithVideo(video);

      const plyrInstance = Plyr.mock.instances[0];
      plyrInstance.currentTime = 20;
      plyrInstance.__callEventCallback('play', {
        detail: { plyr: plyrInstance },
      });

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
      beforeEach(() => {
        Plyr.mockClear();
      });

      it('does not restrict streamingTechnique load when there is no start time', () => {
        const segment = {
          end: 60,
        };

        mediaPlayer.configureWithVideo(video, segment);

        expect(mockStreamingTechnique.initialise).toHaveBeenCalledWith(
          video.playback,
          undefined,
        );

        const plyrInstance = Plyr.mock.instances[0];
        plyrInstance.__callEventCallback('play', {
          detail: { plyr: plyrInstance },
        });

        expect(mockStreamingTechnique.startLoad).toHaveBeenCalledWith(
          undefined,
        );
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

        const plyrInstance = Plyr.mock.instances[0];
        plyrInstance.__callEventCallback('play', {
          detail: { plyr: plyrInstance },
        });

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

        const plyrInstance = Plyr.mock.instances[0];
        plyrInstance.currentTime = 60;
        plyrInstance.__callEventCallback('timeupdate', {
          detail: { plyr: plyrInstance },
        });

        expect(mockStreamingTechnique.stopLoad).toHaveBeenCalled();
      });
    });
  });

  describe('With YouTube', () => {
    it('does not get a StreamingTechnique', () => {
      mediaPlayer.configureWithVideo(
        VideoFactory.sample(PlaybackFactory.youtubeSample()),
      );

      expect(StreamingTechniqueFactory.get).not.toHaveBeenCalled();
    });
  });
});

const testData = [
  { type: 'stream', segmentedVideo: VideoFactory.sample() },
  {
    type: 'youtube',
    segmentedVideo: VideoFactory.sample(PlaybackFactory.youtubeSample()),
  },
];

testData.forEach(({ type, segmentedVideo }) =>
  describe('segment playback restriction for ' + type, () => {
    beforeEach(() => {
      Plyr.mockClear();
    });

    it(
      type + ' should set the currentTime at the beginning of the segment',
      () => {
        const segment = {
          start: 30,
        };

        mediaPlayer.configureWithVideo(segmentedVideo, segment);

        const plyrInstance = Plyr.mock.instances[0];
        expect(plyrInstance.currentTime).toEqual(segment.start);
      },
    );

    it(
      type +
        ' should add a playing event to set seek to the beginning of the segment',
      () => {
        const segment = {
          start: 30,
        };

        mediaPlayer.configureWithVideo(segmentedVideo, segment);

        const plyrInstance = Plyr.mock.instances[0];
        // Some browsers won't set currentTime if it hasn't loaded the data
        plyrInstance.currentTime = 0;

        plyrInstance.__callEventCallback('playing', {
          detail: { plyr: plyrInstance },
        });

        expect(plyrInstance.currentTime).toEqual(segment.start);
      },
    );

    it(type + ' should pause playback at the end of the segment', () => {
      const segment = {
        end: 60,
      };

      mediaPlayer.configureWithVideo(segmentedVideo, segment);

      const plyrInstance = Plyr.mock.instances[0];
      plyrInstance.currentTime = 60;
      plyrInstance.__callEventCallback('timeupdate', {
        detail: { plyr: plyrInstance },
      });

      expect(plyrInstance.pause).toHaveBeenCalled();
    });

    it(type + ' should not auto pause again after it has paused once', () => {
      const segment = {
        end: 60,
      };

      mediaPlayer.configureWithVideo(segmentedVideo, segment);

      const plyrInstance = Plyr.mock.instances[0];
      plyrInstance.currentTime = 60;
      plyrInstance.__callEventCallback('timeupdate', {
        detail: { plyr: plyrInstance },
      });

      expect(plyrInstance.pause).toBeCalledTimes(1);

      plyrInstance.currentTime = 65;
      plyrInstance.__callEventCallback('timeupdate', {
        detail: { plyr: plyrInstance },
      });

      expect(plyrInstance.pause).toBeCalledTimes(1);
    });

    it(
      type + ' should not pause if the segment end is earlier than the start',
      () => {
        const segment = {
          start: 45,
          end: 20,
        };

        mediaPlayer.configureWithVideo(segmentedVideo, segment);

        const plyrInstance = Plyr.mock.instances[0];

        expect(plyrInstance.on).not.toHaveBeenCalledWith(
          'timeupdate',
          expect.anything(),
        );
      },
    );

    it(type + ' should not apply segment limits when video is changed', () => {
      const segment = {
        start: 30,
        end: 60,
      };

      mediaPlayer.configureWithVideo(segmentedVideo, segment);

      let plyrInstance = Plyr.mock.instances[0];
      expect(plyrInstance.currentTime).toEqual(30);

      plyrInstance.currentTime = 60;
      plyrInstance.__callEventCallback('timeupdate', {
        detail: { plyr: plyrInstance },
      });

      expect(plyrInstance.pause).toHaveBeenCalledTimes(1);

      mediaPlayer.configureWithVideo(
        VideoFactory.sample(PlaybackFactory.youtubeSample()),
      );

      plyrInstance = Plyr.mock.instances[1];

      expect(plyrInstance.currentTime).toBeUndefined();

      plyrInstance.currentTime = 60;
      plyrInstance.__callEventCallback('timeupdate', {
        detail: { plyr: plyrInstance },
      });

      expect(plyrInstance.pause).not.toHaveBeenCalled();
    });
  }),
);

it('Will play', () => {
  mediaPlayer.configureWithVideo(video);

  mediaPlayer.play();
  const plyrInstance = Plyr.mock.instances[1];
  expect(plyrInstance.play).toHaveBeenCalled();
});

it('Will pause', () => {
  mediaPlayer.configureWithVideo(video);

  mediaPlayer.pause();
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

    mediaPlayer.destroy();

    expect(player.getAnalytics().handlePause).toHaveBeenCalledWith(15);

    expect((window as any).__callbacks.beforeunload).toHaveLength(0);
  });

  describe('interaction events', () => {
    it('sends an interaction event when the plyr enters fullscreen', () => {
      const plyr = {
        currentTime: 124,
      };

      plyrInstance.__callEventCallback('enterfullscreen', {
        detail: { plyr },
      });

      expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        124,
        'fullscreenEnabled',
        {},
      );
    });

    it('sends an interaction event when the plyr leaves fullscreen', () => {
      const plyr = {
        currentTime: 127,
      };

      plyrInstance.__callEventCallback('exitfullscreen', { detail: { plyr } });

      expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        127,
        'fullscreenDisabled',
        {},
      );
    });

    it.skip('sends an interaction event when the captions are turned on', () => {
      const plyr = {
        currentTime: 124,
        captions: {
          currentTrackNode: {
            kind: 'Captions',
            label: 'English',
            language: 'en',
            id: '',
          },
        },
      };

      plyrInstance.__callEventCallback('captionsenabled', {
        detail: { plyr },
      });

      expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
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

    it.skip('sends an interaction event when the captions change language', () => {
      const plyr = {
        currentTime: 125,
        captions: {
          currentTrackNode: {
            kind: 'Captions',
            label: 'Dutch',
            language: 'nl',
            id: '123',
          },
        },
      };

      plyrInstance.__callEventCallback('languagechange', { detail: { plyr } });

      expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
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

    it.skip('sends an interaction event when the captions are turned off', () => {
      const plyr = { currentTime: 125 };

      plyrInstance.__callEventCallback('captionsdisabled', {
        detail: { plyr },
      });

      expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        125,
        'captionsDisabled',
        {},
      );
    });

    it('sends an interaction event when the speed of the playback changes', () => {
      const plyr = { currentTime: 125, speed: 1.25 };

      plyrInstance.__callEventCallback('ratechange', {
        detail: { plyr },
      });

      expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        125,
        'speedChanged',
        {
          speed: 1.25,
        },
      );
    });
  });
});

describe('is listening for plyr events', () => {
  let plyrInstance;

  beforeEach(() => {
    plyrInstance = Plyr.mock.instances[0];
  });

  it('adds a --fullscreen class to the container on enterfullscreen', () => {
    expect(container.classList).not.toContain('plyr--fullscreen');
    plyrInstance.__callEventCallback('enterfullscreen', {
      detail: { plyr: { currentTime: 0 } },
    });
    expect(container.classList).toContain('plyr--fullscreen');
  });

  it('removes a --fullscreen class to the container on exitfullscreen', () => {
    container.classList.add('plyr--fullscreen');
    plyrInstance.__callEventCallback('exitfullscreen', {
      detail: { plyr: { currentTime: 0 } },
    });
    expect(container.classList).not.toContain('plyr--fullscreen');
  });
});

describe('when asked to destroy', () => {
  let mockStreamingTechnique: MaybeMocked<StreamingTechnique> = null;

  beforeEach(() => {
    mockStreamingTechnique = mocked(StreamingTechniqueFactory.get(player));
  });

  it('calls destroy on Plyr', () => {
    mediaPlayer.destroy();
    const plyrInstance = Plyr.mock.instances[0];

    expect(plyrInstance.destroy).toHaveBeenCalled();
  });

  it('catches exceptions from the destroy function of plyr', () => {
    const plyrInstance = Plyr.mock.instances[0];
    plyrInstance.destroy.mockImplementation(() => {
      throw Error('This should not bubble');
    });

    expect(() => {
      mediaPlayer.destroy();
    }).not.toThrow();
  });

  it('calls destroy on streamingTechnique', () => {
    mediaPlayer.configureWithVideo(
      VideoFactory.sample(PlaybackFactory.streamSample()),
    );

    mediaPlayer.destroy();

    expect(mockStreamingTechnique.destroy).toHaveBeenCalled();
  });

  it('catches exceptions from the destroy function of streamingTechnique', () => {
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

  it('sends a pause event on destruction', () => {
    const plyrInstance = Plyr.mock.instances[0];
    plyrInstance.currentTime = 50;

    mediaPlayer.destroy();

    expect(player.getAnalytics().handlePause).toHaveBeenCalledWith(50);
  });
});

describe('option configuration', () => {
  it('will pass through the control options', () => {
    player = new BoclipsPlayer(container, {
      interface: { controls: ['play-large'] },
    });

    mediaPlayer = new PlyrWrapper(player);

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

  mediaPlayer.destroy();

  mediaPlayer.configureWithVideo(VideoFactory.sample());

  expect(sourceSetSpy).not.toHaveBeenCalled();
});
