import Plyr from 'plyr';

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
import { HasClientDimensions } from '../../test-support/types';
import { MediaPlayer } from '../MediaPlayer';
import { Addons } from './Addons/Addons';
import PlyrWrapper from './PlyrWrapper';
import { MockedPlyr } from '../../../__mocks__/plyr';
import eventually from '../../test-support/eventually';
import { Video } from '../../types/Video';
import { mocked, MockedShallow } from 'jest-mock';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Analytics } from '../../Events/Analytics';

jest.mock('../../StreamingTechnique/StreamingTechniqueFactory');
jest.mock('./Addons/Addons');

let video: Video;

let plyrContainer: HTMLElement & HasClientDimensions;
let mockPlayer: MockedShallow<PrivatePlayer> | PrivatePlayer;
let mediaPlayer: MediaPlayer;
let mockPlyr;

const mockedPlyr = mocked(Plyr);

function getLatestMockPlyrInstance() {
  return mockedPlyr.mock.instances[
    mockedPlyr.mock.instances.length - 1
  ] as unknown as MockedPlyr;
}

function getLatestMockPlyrConstructor() {
  return mockedPlyr.mock.calls[mockedPlyr.mock.calls.length - 1];
}

beforeEach(() => {
  video = VideoFactory.sample();

  mockedPlyr.mockClear();

  const container = document.createElement('div');

  plyrContainer = document.createElement('div') as any;
  plyrContainer.__jsdomMockClientWidth = 700;
  container.appendChild(plyrContainer);

  const progress = document.createElement('div');
  plyrContainer.appendChild(progress);

  mockPlayer = new BoclipsPlayer(plyrContainer);
  mediaPlayer = mockPlayer.getMediaPlayer();

  mockPlyr = getLatestMockPlyrInstance() as MockedPlyr;
  mockPlyr.elements.container = plyrContainer;
  mockPlyr.elements.progress = progress;

  const analytics = new Analytics(mockPlayer);
  jest.spyOn(mockPlayer, 'getAnalytics').mockReturnValue(analytics);

  jest.spyOn(analytics, 'handlePause');
  jest.spyOn(analytics, 'handlePlay');
  jest.spyOn(analytics, 'handleTimeUpdate');
  jest.spyOn(analytics, 'handleInteraction');

  const errorHandler = mockPlayer.getErrorHandler();
  jest.spyOn(errorHandler, 'handleError');
});

describe('Instantiation', () => {
  it('is configured according to the provided options', () => {
    const actualOptions = mockedPlyr.mock.calls[0][1];
    expect(actualOptions?.controls).toEqual(
      expect.arrayContaining(['play-large']),
    );
  });

  it('Constructs a Plyr given an element a video element within container', () => {
    expect(plyrContainer.children.length).toEqual(1);

    const videoElement = plyrContainer.children.item(0);
    expect(videoElement?.tagName).toEqual('VIDEO');
    expect(videoElement?.getAttribute('data-qa')).toEqual('boclips-player');
    expect(videoElement?.getAttribute('preload')).toEqual('metadata');

    expect(Plyr).toHaveBeenCalledWith(
      videoElement,
      expect.objectContaining({
        captions: expect.objectContaining({ update: true }),
      }),
    );
  });
});

describe('Stream Playback', () => {
  let mockStreamingTechnique: MockedShallow<StreamingTechnique>;

  beforeEach(() => {
    const streamingTechniqueFactory = StreamingTechniqueFactory.get(mockPlayer);

    if (streamingTechniqueFactory) {
      mockStreamingTechnique = mocked<StreamingTechnique>(
        streamingTechniqueFactory,
      );
    }
  });

  it('sets the poster on the video element', () => {
    mediaPlayer.configureWithVideo(video);

    const videoElement = getLatestMockPlyrConstructor()[0] as HTMLElement;

    expect(videoElement.getAttribute('poster')).toEqual(
      video.playback.links.thumbnail?.getTemplatedLink({
        thumbnailWidth: 700,
      }),
    );
  });

  it('does not set the poster on the video element if thumbnail link is not set', () => {
    video.playback.links.thumbnail = undefined;

    mediaPlayer.configureWithVideo(video);

    const videoElement = getLatestMockPlyrConstructor()[0] as HTMLElement;

    expect(videoElement.getAttribute('poster')).toBeNull();
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

    mockPlyr = getLatestMockPlyrInstance();
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
  let mockStreamingTechnique: MockedShallow<StreamingTechnique>;
  const setupMockPlayer = () => {
    mockedPlyr.mockClear();
    const streamingTechniqueFactory = StreamingTechniqueFactory.get(mockPlayer);

    if (streamingTechniqueFactory) {
      mockStreamingTechnique = mocked<StreamingTechnique>(
        streamingTechniqueFactory,
      );
    }
    mockPlayer = mocked(
      new BoclipsPlayer(plyrContainer, { interface: { controls: [] } }),
    );

    const analytics = new Analytics(mockPlayer);
    jest.spyOn(mockPlayer, 'getAnalytics').mockReturnValue(analytics);

    jest.spyOn(analytics, 'handlePause');
    jest.spyOn(analytics, 'handlePlay');
    jest.spyOn(analytics, 'handleTimeUpdate');
    jest.spyOn(analytics, 'handleInteraction');

    mediaPlayer = mockPlayer.getMediaPlayer();

    mockPlyr = getLatestMockPlyrInstance();
  };

  describe('For youtube', () => {
    const youtubeVideo = VideoFactory.sample(PlaybackFactory.youtubeSample());
    it('should set the currentTime at the beginning of the segment', () => {
      const segment = {
        start: 30,
      };
      setupMockPlayer();

      mediaPlayer.configureWithVideo(youtubeVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();
      expect(mockPlyr.currentTime).toEqual(segment.start);
    });

    it('should add a playing event to set seek to the beginning of the segment', () => {
      const segment = {
        start: 30,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(youtubeVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();
      // Some browsers won't set currentTime if it hasn't loaded the data
      mockPlyr.currentTime = 0;

      mockPlyr.__callEventCallback('playing');

      expect(mockPlyr.currentTime).toEqual(segment.start);
    });

    it('should pause playback at the end of the segment', () => {
      const segment = {
        end: 60,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(youtubeVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();
      mockPlyr.currentTime = 61;
      mockPlyr.__callEventCallback('timeupdate');

      expect(mockPlyr.pause).toHaveBeenCalled();
    });

    it('should not auto pause again after it has paused once', () => {
      const segment = {
        end: 60,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(youtubeVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();
      mockPlyr.currentTime = 61;
      mockPlyr.__callEventCallback('timeupdate');

      expect(mockPlyr.pause).toBeCalledTimes(1);

      mockPlyr.currentTime = 65;
      mockPlyr.__callEventCallback('timeupdate');

      expect(mockPlyr.pause).toBeCalledTimes(2);
    });

    it('should not pause if the segment end is earlier than the start', () => {
      const segment = {
        start: 45,
        end: 20,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(youtubeVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();

      expect(mockPlayer.getAnalytics().handlePause).not.toHaveBeenCalled();
    });

    it('should not apply segment limits when video is changed', () => {
      const segment = {
        start: 30,
        end: 60,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(youtubeVideo, segment);

      mockPlyr = getLatestMockPlyrInstance() as MockedPlyr;
      const plyrPauseFn = jest.fn();
      mockPlyr.pause = plyrPauseFn;
      expect(mockPlyr.currentTime).toEqual(30);

      mockPlyr.currentTime = 61;
      mockPlyr.__callEventCallback('timeupdate');

      expect(plyrPauseFn).toHaveBeenCalledTimes(1);

      mediaPlayer.configureWithVideo(
        VideoFactory.sample(PlaybackFactory.youtubeSample()),
      );

      mockPlyr = getLatestMockPlyrInstance();
      const secondPlyrPauseFn = jest.fn();
      mockPlyr.pause = secondPlyrPauseFn;

      expect(mockPlyr.currentTime).toBeUndefined();

      mockPlyr.currentTime = 60;
      mockPlyr.__callEventCallback('timeupdate');

      expect(secondPlyrPauseFn).not.toHaveBeenCalled();
    });
  });

  describe('For stream', () => {
    const streamingVideo = VideoFactory.sample();
    it('should set the currentTime at the beginning of the segment', () => {
      const segment = {
        start: 30,
      };
      setupMockPlayer();

      mediaPlayer.configureWithVideo(streamingVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();
      expect(mockPlyr.currentTime).toEqual(segment.start);
    });

    it('should add a playing event to set seek to the beginning of the segment', () => {
      const segment = {
        start: 30,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(streamingVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();
      // Some browsers won't set currentTime if it hasn't loaded the data
      mockPlyr.currentTime = 0;

      mockPlyr.__callEventCallback('playing');

      expect(mockPlyr.currentTime).toEqual(segment.start);
    });

    it('should pause playback at the end of the segment', () => {
      const segment = {
        end: 60,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(streamingVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();
      mockPlyr.currentTime = 61;
      mockPlyr.__callEventCallback('timeupdate');

      expect(mockPlyr.pause).toHaveBeenCalled();
    });

    it('should not auto pause again after it has paused once', () => {
      const segment = {
        end: 60,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(streamingVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();
      mockPlyr.currentTime = 61;
      mockPlyr.__callEventCallback('timeupdate');

      expect(mockPlyr.pause).toBeCalledTimes(1);

      mockPlyr.currentTime = 65;
      mockPlyr.__callEventCallback('timeupdate');

      expect(mockPlyr.pause).toBeCalledTimes(2);
    });

    it('should not pause if the segment end is earlier than the start', () => {
      const segment = {
        start: 45,
        end: 20,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(streamingVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();

      expect(mockPlayer.getAnalytics().handlePause).not.toHaveBeenCalled();
    });

    it('should not apply segment limits when video is changed', () => {
      const segment = {
        start: 30,
        end: 60,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(streamingVideo, segment);

      mockPlyr = getLatestMockPlyrInstance();
      const plyrPauseFn = jest.fn();
      mockPlyr.pause = plyrPauseFn;

      expect(mockPlyr.currentTime).toEqual(30);

      mockPlyr.currentTime = 61;
      mockPlyr.__callEventCallback('timeupdate');

      expect(plyrPauseFn).toHaveBeenCalledTimes(1);

      mediaPlayer.configureWithVideo(
        VideoFactory.sample(PlaybackFactory.youtubeSample()),
      );

      mockPlyr = getLatestMockPlyrInstance();
      const secondPlyrPauseFn = jest.fn();
      mockPlyr.pause = secondPlyrPauseFn;

      expect(mockPlyr.currentTime).toBeUndefined();

      mockPlyr.currentTime = 60;
      mockPlyr.__callEventCallback('timeupdate');

      expect(secondPlyrPauseFn).not.toHaveBeenCalled();
    });
  });

  describe('Addons', () => {
    it('initialises the addon when it can be enabled', () => {
      const mockAddon = mocked(Addons[0]);

      mockAddon.mockClear();

      mediaPlayer.configureWithVideo(video);

      expect(mockAddon).toHaveBeenCalled();
    });

    it('does not initialise the addon when it cannot be enabled', () => {
      const mockAddon = mocked(Addons[0]);

      mockAddon.mockClear();

      mockAddon.isEnabled.mockReturnValueOnce(false);

      mediaPlayer.configureWithVideo(video);

      expect(mockAddon).not.toHaveBeenCalled();
    });

    it('destroys any enabled addons too', () => {
      const mockAddon = (mediaPlayer as PlyrWrapper).getEnabledAddons()[0];

      mediaPlayer.destroy();

      expect(mockAddon.destroy).toHaveBeenCalled();
    });
  });

  describe('Passthrough API', () => {
    it('Will play', () => {
      mediaPlayer.configureWithVideo(video);

      mediaPlayer.play();
      mockPlyr = getLatestMockPlyrInstance();
      expect(mockPlyr.play).toHaveBeenCalled();
    });

    it('Will pause', () => {
      mediaPlayer.configureWithVideo(video);

      mediaPlayer.pause();
      mockPlyr = getLatestMockPlyrInstance();
      expect(mockPlyr.pause).toHaveBeenCalled();
    });
  });

  describe('Playback Tracking', () => {
    it('will add an on playing event listener that delegates to the Analytics', () => {
      mockPlyr.currentTime = 10;
      mockPlyr.__callEventCallback('playing');

      expect(mockPlayer.getAnalytics().handlePlay).toHaveBeenCalledWith(10);
    });

    it('will add an on pause event listener that delegates to the Analytics', () => {
      mockPlyr.currentTime = 15;
      mockPlyr.__callEventCallback('pause');

      expect(mockPlayer.getAnalytics().handlePause).toHaveBeenCalledWith(15);
    });

    it('will add an on timeupdate event listener that delegates to the Analytics', () => {
      mockPlyr.currentTime = 15;
      mockPlyr.__callEventCallback('timeupdate');

      expect(mockPlayer.getAnalytics().handleTimeUpdate).toHaveBeenCalledWith(
        15,
      );
    });

    it('will call on pause when the navigation is about to change', () => {
      const callbacks = (window as any).__eventListeners.beforeunload;

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

    it('updates the streaming captions when the captions are changed', () => {
      const segment = {
        end: 60,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(video, segment);
      mockPlyr.currentTrack = 0;

      mockPlyr.__callEventCallback('languagechange');

      expect(mockStreamingTechnique.changeCaptions).toHaveBeenCalledWith(0);
    });

    it('sends interaction event for seeked', () => {
      setupMockPlayer();
      mockPlyr.currentTime = 125;
      mediaPlayer.configureWithVideo(video);

      mockPlyr.__callEventCallback('seeked');
      expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        125,
        'seeked',
        {},
      );
    });
  });

  describe('Fullscreen', () => {
    it('adds a --fullscreen class to the container on enterfullscreen', () => {
      expect(plyrContainer.classList).not.toContain('plyr--fullscreen');

      mockPlyr.__callEventCallback('enterfullscreen');

      expect(plyrContainer.classList).toContain('plyr--fullscreen');
    });

    it('removes a --fullscreen class to the container on exitfullscreen', () => {
      plyrContainer.classList.add('plyr--fullscreen');

      mockPlyr.__callEventCallback('exitfullscreen');

      expect(plyrContainer.classList).not.toContain('plyr--fullscreen');
    });
  });

  describe('Error Handling', () => {
    it('does nothing when the media has no error', () => {
      // TODO: Deleting a read-only property?
      delete mockPlyr.media.error;
      expect(() => {
        mockPlyr.__callEventCallback('error');
      }).not.toThrow();
    });

    it('passes the media error to the ErrorHandler', () => {
      // TODO: Assigning to a read-only property?
      mockPlyr.media.error = {
        code: 44444,
        message: 'Four Four Four Four Four',
      };

      mockPlyr.__callEventCallback('error');

      expect(mockPlayer.getErrorHandler().handleError).toHaveBeenCalledWith({
        fatal: true,
        type: 'PLAYBACK_ERROR',
        payload: {
          code: 44444,
          message: 'Four Four Four Four Four',
        },
      });
    });
  });

  describe('Destruction', () => {
    beforeEach(() => {
      const streamingTechniqueFactory =
        StreamingTechniqueFactory.get(mockPlayer);

      if (streamingTechniqueFactory) {
        mockStreamingTechnique = mocked<StreamingTechnique>(
          streamingTechniqueFactory,
        );
      }
    });

    it('destroys the Plyr instance', () => {
      mediaPlayer.destroy();

      expect(mockPlyr.destroy).toHaveBeenCalled();
    });

    it('catches exceptions from Plyr destruction', () => {
      mockPlyr.destroy = jest.fn(() => {
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

    it('sends a playbackStarted interaction event on first play', () => {
      mockPlyr.currentTime = 50;

      mockPlyr.__callEventCallback('play');

      expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        50,
        'playbackStarted',
        {},
      );
    });

    it('sends a play interaction event from second play', () => {
      mockPlyr.currentTime = 50;

      mockPlyr.__callEventCallback('play');

      mockPlyr.currentTime = 70;

      mockPlyr.__callEventCallback('play');

      expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        70,
        'play',
        {},
      );
    });

    it('sends a pause interaction event', () => {
      mockPlyr.currentTime = 80;

      mockPlyr.__callEventCallback('pause');

      expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        80,
        'pause',
        {},
      );
    });

    it('sends a captionsEnabled interaction event', () => {
      mockPlyr.currentTime = 80;

      mockPlyr.__callEventCallback('captionsenabled');

      expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        80,
        'captionsEnabled',
        {},
      );
    });

    it('sends a captionsDisbled interaction event', () => {
      mockPlyr.currentTime = 80;

      mockPlyr.__callEventCallback('captionsdisabled');

      expect(mockPlayer.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        80,
        'captionsDisabled',
        {},
      );
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
      expect((window as any).__eventListeners.beforeunload).toHaveLength(1);

      mockPlyr.currentTime = 15;

      mediaPlayer.destroy();

      expect(mockPlayer.getAnalytics().handlePause).toHaveBeenCalledWith(15);

      expect((window as any).__eventListeners.beforeunload).toHaveLength(0);
    });

    it('does not emit a handlePause event after destruction', () => {
      const callbacks = (window as any).__eventListeners.beforeunload;

      expect(callbacks).toHaveLength(1);

      const beforeunload = callbacks[0];

      mediaPlayer.destroy();

      expect(mockPlayer.getAnalytics().handlePause).toHaveBeenCalledTimes(1);

      beforeunload();

      expect(mockPlayer.getAnalytics().handlePause).toHaveBeenCalledTimes(1);
    });
  });

  describe('onEnd', () => {
    let plyr: MockedPlyr;
    let mockContainer: HTMLDivElement;

    beforeEach(() => {
      const plyrContainer = document.createElement('div') as any;
      plyrContainer.__jsdomMockClientWidth = 700;
      mockContainer = document.createElement('div') as any;
      mockContainer.appendChild(plyrContainer);
      plyr = new Plyr(plyrContainer) as MockedPlyr;
      plyr.elements.container = mockContainer;
    });

    it('calls the function passed into onEnd', () => {
      const mockOnPlay = jest.fn<() => (endOverlay: HTMLDivElement) => void>();
      mediaPlayer.onEnd(mockOnPlay());
      plyr.__callEventCallback('ended');
      expect(mockOnPlay).toHaveBeenCalledTimes(1);
    });

    it('onEnd calls createIfNotExists to check if overlay exists', () => {
      const mockOnPlay = jest.fn<() => (endOverlay: HTMLDivElement) => void>();
      mediaPlayer.onEnd(mockOnPlay());
      plyr.__callEventCallback('ended');
      eventually(() => {
        // TODO: This assertion does not work ...
        expect(mockContainer.innerHTML).toContain('overlay');
      });
    });
  });

  describe(`onReady`, () => {
    it('calls the on ready callback when the video is configured', async () => {
      const onReadyCallback = jest.fn();
      mediaPlayer.onReady(onReadyCallback);

      let video = VideoFactory.sample();
      mediaPlayer.configureWithVideo(video);

      expect(onReadyCallback).toHaveBeenCalledWith({
        plyr: getLatestMockPlyrInstance(),
        video: video,
      });
    });

    it('can handle a when there is no on ready callback', async () => {
      let video = VideoFactory.sample();
      expect(() => mediaPlayer.configureWithVideo(video)).not.toThrow();
    });

    it('can handle a when there is the wrong type of callback is passed in', async () => {
      mediaPlayer.onReady('hello' as any);

      let video = VideoFactory.sample();
      expect(() => mediaPlayer.configureWithVideo(video)).not.toThrow();
    });
  });

  describe('with a playback segment', () => {
    it('does not restrict streamingTechnique load when there is no start time', () => {
      const segment = {
        end: 60,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(video, segment);

      expect(mockStreamingTechnique.initialise).toHaveBeenCalledWith(
        video.playback,
        undefined,
      );

      mockPlyr = getLatestMockPlyrInstance();
      mockPlyr.__callEventCallback('play');

      expect(mockStreamingTechnique.startLoad).toHaveBeenCalledWith(undefined);
    });

    it('restricts the initial streamingTechnique load when a playback segment is provided', () => {
      const segment = {
        start: 30,
        end: 60,
      };
      setupMockPlayer();
      mediaPlayer.configureWithVideo(VideoFactory.sample(), segment);

      expect(mockStreamingTechnique.initialise).toHaveBeenCalledWith(
        video.playback,
        segment.start,
      );

      mockPlyr = getLatestMockPlyrInstance();
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
      setupMockPlayer();
      mediaPlayer.configureWithVideo(VideoFactory.sample(), segment);

      mockPlyr = getLatestMockPlyrInstance();
      mockPlyr.currentTime = 61;
      mockPlyr.__callEventCallback('timeupdate');

      expect(mockStreamingTechnique.stopLoad).toHaveBeenCalled();
    });

    it('Will not allow play outside of the segment end', () => {
      const segment = {
        start: 30,
        end: 50,
      };

      setupMockPlayer();
      mediaPlayer.configureWithVideo(VideoFactory.sample(), segment);

      mockPlyr = getLatestMockPlyrInstance();
      mockPlyr.currentTime = 51;
      mockPlyr.__callEventCallback('play');

      expect(mockPlyr.play).not.toHaveBeenCalled();
    });

    it('Will not allow seeking after the segment end', () => {
      const segment = {
        start: 30,
        end: 50,
      };

      setupMockPlayer();
      mediaPlayer.configureWithVideo(VideoFactory.sample(), segment);

      mockPlyr = getLatestMockPlyrInstance();
      mockPlyr.currentTime = 60;
      mockPlyr.__callEventCallback('seeking');
      expect(mockPlyr.play).not.toHaveBeenCalled();
      expect(mockPlyr.currentTime).toEqual(50);
    });

    it('Will not allow seeking before the segment start', () => {
      const segment = {
        start: 30,
        end: 50,
      };

      setupMockPlayer();
      mediaPlayer.configureWithVideo(VideoFactory.sample(), segment);

      mockPlyr = getLatestMockPlyrInstance();
      mockPlyr.currentTime = 25;
      mockPlyr.__callEventCallback('seeking');

      expect(mockPlyr.play).not.toHaveBeenCalled();
      expect(mockPlyr.currentTime).toEqual(30);
    });
  });
});
