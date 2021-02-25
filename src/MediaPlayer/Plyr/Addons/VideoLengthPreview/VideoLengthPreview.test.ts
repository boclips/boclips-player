import { PlaybackFactory } from '../../../../test-support/TestFactories';
import Plyr from 'plyr';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { VideoLengthPreview } from './VideoLengthPreview';
import { HasClientDimensions } from '../../../../test-support/types';
import { MockedPlyr } from '../../../../../__mocks__/plyr';

let plyr: MockedPlyr;

describe('Video Length Preview', () => {
  describe('Feature Enabling', () => {
    const testData = [
      {
        when: 'all checks green',
        playback: PlaybackFactory.streamSample(),
        videoLengthPreview: true,
        expected: true,
      },
      {
        when: 'duration badge option is disabled',
        playback: PlaybackFactory.streamSample(),
        videoLengthPreview: false,
        expected: false,
      },
      {
        when: 'playback is null',
        playback: null,
        videoLengthPreview: true,
        expected: false,
      },
      {
        when: 'playback is of type YOUTUBE',
        playback: PlaybackFactory.youtubeSample(),
        videoLengthPreview: true,
        expected: false,
      },
    ];

    testData.forEach(({ when, playback, videoLengthPreview, expected }) => {
      it(`will return ${expected} when ${when}`, () => {
        const actual = VideoLengthPreview.canBeEnabled(
          new Plyr(document.createElement('div')),
          playback,
          {
            addons: {
              videoLengthPreview,
            },
          } as InterfaceOptions,
        );

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('video-length-preview renders', () => {
    beforeEach(() => {
      const plyrContainer = document.createElement('div') as HTMLDivElement &
        HasClientDimensions;
      plyrContainer.__jsdomMockClientWidth = 500;

      plyr = new Plyr(plyrContainer) as MockedPlyr;
      plyr.elements.container = plyrContainer;
    });
    const getVideoLengthPreview = (playback = PlaybackFactory.streamSample()) =>
      new VideoLengthPreview(plyr, playback as any);

    const findVideoLengthPreview = () =>
      plyr.elements.container.querySelector(
        '.video-length-preview',
      ) as HTMLDivElement;

    it('shows the video-length-preview before video is played', () => {
      const playback = PlaybackFactory.streamSample({ duration: 124 });

      getVideoLengthPreview(playback);

      expect(findVideoLengthPreview().innerHTML).toEqual('2:04');
    });
    it('destroys the video-length-preview after video is played', () => {
      const playback = PlaybackFactory.streamSample();

      getVideoLengthPreview(playback);

      expect(findVideoLengthPreview()).not.toBeNull();

      plyr.__callEventCallback('play');

      expect(findVideoLengthPreview()).toBeNull();

      plyr.__callEventCallback('pause');

      expect(findVideoLengthPreview()).toBeNull();
    });
  });
});
