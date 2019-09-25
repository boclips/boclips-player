import Plyr from 'plyr';
import { PlaybackFactory } from '../../../test-support/TestFactories';
import { HasClientDimensions } from '../../../test-support/types';
import { Playback } from '../../../types/Playback';
import { InterfaceOptions } from '../../InterfaceOptions';
import { HoverPreview } from './HoverPreview';

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
      const actual = HoverPreview.canBeEnabled(new Plyr(), playback, {
        addons: {
          hoverPreview: hoverPreviewOption,
        },
      } as InterfaceOptions);

      expect(actual).toEqual(expected);
    });
  });
});

describe('HoverPreview', () => {
  let plyrContainer: HTMLDivElement & HasClientDimensions;
  let playback: Playback;
  let plyr: Plyr.Plyr;
  let addon: HoverPreview;

  beforeEach(() => {
    plyrContainer = document.createElement('div') as HTMLDivElement &
      HasClientDimensions;
    plyrContainer.__jsdomMockClientWidth = 500;

    plyr = new Plyr();
    plyr.elements.container = plyrContainer;

    playback = PlaybackFactory.streamSample();

    addon = new HoverPreview(plyr, playback, {
      addons: { hoverPreview: true },
    } as any);
  });

  describe('loading the sprite', () => {
    it('will load the image immediately', () => {
      const hiddenContainer = plyrContainer.querySelector(
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
      const container = plyrContainer.querySelector('.hover-preview');

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
      const container = plyrContainer.querySelector('.hover-preview');
      expect(container).toBeTruthy();
      expect(container.classList).toContain('hover-preview--hidden');

      const event = new Event('mouseover');
      plyrContainer.dispatchEvent(event);

      expect(container.classList).not.toContain('hover-preview--hidden');
    });

    it('will hide the addon on mouseover', () => {
      const container = plyrContainer.querySelector('.hover-preview');
      expect(container).toBeTruthy();
      expect(container.classList).toContain('hover-preview--hidden');

      const mouseoverEvent = new Event('mouseover');
      plyrContainer.dispatchEvent(mouseoverEvent);

      expect(container.classList).not.toContain('hover-preview--hidden');

      const mouseoutEvent = new Event('mouseout');
      plyrContainer.dispatchEvent(mouseoutEvent);

      expect(container.classList).toContain('hover-preview--hidden');
    });
  });

  describe('animation', () => {
    it.todo('will animate while mouse hovering');
    it.todo('will not animate while loading');
  });

  describe('destruction', () => {
    it('will destroy itself when user clicks play', () => {
      const container = plyrContainer.querySelector('.hover-preview');

      expect(plyrContainer.children).toContain(container);

      plyr.__callEventCallback('play');

      expect(plyrContainer.children).not.toContain(container);
    });

    it('can be destroyed', () => {
      const container = plyrContainer.querySelector('.hover-preview');

      expect(plyrContainer.children).toContain(container);

      addon.destroy();

      expect(plyrContainer.children).not.toContain(container);
    });
  });
});
