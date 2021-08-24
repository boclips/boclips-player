import Plyr from 'plyr';
import { MockedPlyr } from '../../../../../__mocks__/plyr';
import { PlaybackFactory } from '../../../../test-support/TestFactories';
import { HasClientDimensions } from '../../../../test-support/types';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { defaultHoverPreviewOptions, HoverPreview } from './HoverPreview';

let plyr: MockedPlyr;

beforeEach(() => {
  const plyrContainer = document.createElement('div') as HTMLDivElement &
    HasClientDimensions;
  plyrContainer.__jsdomMockClientWidth = 500;

  plyr = new Plyr(plyrContainer) as MockedPlyr;
  plyr.elements.container = plyrContainer;
});

const getHoverPreview = (playback = PlaybackFactory.streamSample()) =>
  new HoverPreview(plyr, playback, {
    addons: { hoverPreview: true },
  } as InterfaceOptions);

describe('Feature Enabling', () => {
  const testData = [
    {
      when: 'all checks green',
      playback: PlaybackFactory.streamSample(),
      hoverPreviewOption: true,
      expected: true,
    },
    {
      when: 'hoverPreview option is disabled',
      playback: PlaybackFactory.streamSample(),
      hoverPreviewOption: false,
      expected: false,
    },
    {
      when: 'playback is null',
      playback: null,
      hoverPreviewOption: true,
      expected: false,
    },
    {
      when: 'playback has no videoPreview',
      playback: PlaybackFactory.streamSample({ links: {} as any }),
      hoverPreviewOption: true,
      expected: false,
    },
  ];

  testData.forEach(({ when, playback, hoverPreviewOption, expected }) => {
    it(`will return ${expected} when ${when}`, () => {
      const actual = HoverPreview.canBeEnabled(
        new Plyr(document.createElement('div')),
        playback,
        {
          addons: {
            hoverPreview: hoverPreviewOption,
          },
        } as InterfaceOptions,
      );

      expect(actual).toEqual(expected);
    });
  });
});

describe('Options', () => {
  interface Test<T = InterfaceOptions['addons']['hoverPreview']> {
    message: string;
    input: T;
    expected: T;
  }
  const testData: Test[] = [
    {
      message: 'default when input is true',
      input: true,
      expected: defaultHoverPreviewOptions,
    },
    {
      message: 'frameCount as specified when input is within limits',
      input: {
        frameCount: 10,
        delayMilliseconds: 400,
      },
      expected: {
        frameCount: 10,
        delayMilliseconds: 400,
      },
    },
    {
      message: 'frameCount to upper bound when input is above upper bound',
      input: {
        frameCount: 100,
        delayMilliseconds: 400,
      },
      expected: {
        frameCount: 15,
        delayMilliseconds: 400,
      },
    },
    {
      message: 'frameCount to lower bound when input is below lower bound',
      input: {
        frameCount: -10,
        delayMilliseconds: 400,
      },
      expected: {
        frameCount: 4,
        delayMilliseconds: 400,
      },
    },
    {
      message: 'delayMilliseconds as specified when input is within limits',
      input: {
        frameCount: 5,
        delayMilliseconds: 550,
      },
      expected: {
        delayMilliseconds: 550,
        frameCount: 5,
      },
    },
    {
      message:
        'delayMilliseconds to upper bound when input is above upper bound',
      input: {
        frameCount: 5,
        delayMilliseconds: 3000,
      },
      expected: {
        delayMilliseconds: 1000,
        frameCount: 5,
      },
    },
    {
      message:
        'delayMilliseconds to lower bound when input is below lower bound',
      input: {
        frameCount: 5,
        delayMilliseconds: -10,
      },
      expected: {
        delayMilliseconds: 200,
        frameCount: 5,
      },
    },
  ];

  testData.forEach(({ message, input, expected }) => {
    it(`is set to ${message}`, () => {
      const addon = new HoverPreview(plyr, PlaybackFactory.streamSample(), {
        controls: null,
        addons: {
          hoverPreview: input,
        },
      });

      expect(addon.getOptions()).toEqual(expected);
    });
  });
});

describe('HoverPreview', () => {
  describe('loading the sprite', () => {
    it('will load the image immediately', () => {
      const playback = PlaybackFactory.streamSample();

      getHoverPreview(playback);

      const hiddenContainer = plyr.elements.container.querySelector(
        '.hover-preview.hover-preview--hidden',
      );
      expect(hiddenContainer).toBeTruthy();

      const window = hiddenContainer.querySelector('.hover-preview__window');
      expect(window).toBeTruthy();

      const image = window.querySelector(
        '.hover-preview__image',
      ) as HTMLImageElement;

      expect(image).toBeTruthy();

      expect(image.src).toEqual(
        playback.links.videoPreview.getTemplatedLink({
          thumbnailWidth: 500,
          thumbnailCount: 5,
        }),
      );
    });

    it('will unhide the addon once the image is loaded', () => {
      getHoverPreview();

      const container = plyr.elements.container.querySelector('.hover-preview');

      expect(container.classList).toContain('hover-preview--loading');

      const image = container.querySelector(
        '.hover-preview__image',
      ) as HTMLImageElement;

      expect(image).toBeTruthy();

      const callback: any = image.onload;
      callback(null);

      expect(container.classList).not.toContain('hover-preview--loading');
    });
  });

  describe('mouse events', () => {
    it('will unhide the addon on mouseover', () => {
      getHoverPreview();

      const container = plyr.elements.container.querySelector('.hover-preview');
      expect(container).toBeTruthy();
      expect(container.classList).toContain('hover-preview--hidden');

      const event = new Event('mouseover');
      plyr.elements.container.dispatchEvent(event);

      expect(container.classList).not.toContain('hover-preview--hidden');
    });

    it('will hide the addon on mouseover', () => {
      getHoverPreview();

      const container = plyr.elements.container.querySelector('.hover-preview');
      expect(container).toBeTruthy();
      expect(container.classList).toContain('hover-preview--hidden');

      const mouseoverEvent = new Event('mouseover');
      plyr.elements.container.dispatchEvent(mouseoverEvent);

      expect(container.classList).not.toContain('hover-preview--hidden');

      const mouseoutEvent = new Event('mouseout');
      plyr.elements.container.dispatchEvent(mouseoutEvent);

      expect(container.classList).toContain('hover-preview--hidden');
    });

    it('clicking on the preview will play the video', () => {
      getHoverPreview();

      const container = plyr.elements.container.querySelector('.hover-preview');

      const clickEvent = new Event('click');
      container.dispatchEvent(clickEvent);

      expect(plyr.play).toHaveBeenCalled();
    });
  });

  describe('destruction', () => {
    it('will destroy itself when user clicks play', () => {
      getHoverPreview();

      const container = plyr.elements.container.querySelector('.hover-preview');

      expect(plyr.elements.container.children).toContain(container);

      plyr.__callEventCallback('play');

      expect(plyr.elements.container.children).not.toContain(container);
    });

    it('can be destroyed', () => {
      const addon = getHoverPreview();

      const container = plyr.elements.container.querySelector('.hover-preview');

      expect(plyr.elements.container.children).toContain(container);

      addon.destroy();

      expect(plyr.elements.container.children).not.toContain(container);
    });
  });

  describe(`segmenting`, () => {});
});
