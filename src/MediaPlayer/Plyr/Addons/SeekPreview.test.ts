import Plyr from 'plyr';
import { PlaybackFactory } from '../../../test-support/TestFactories';
import { Link } from '../../../types/Link';
import { Playback } from '../../../types/Playback';
import { InterfaceOptions } from '../../InterfaceOptions';
import {
  defaultSeekPreviewOptions,
  SeekPreview,
  SeekPreviewOptions,
} from './SeekPreview';

let container;
let plyr: Plyr.Plyr;

beforeEach(() => {
  container = document.createElement('div') as any;

  const plyrContainer = document.createElement('div') as any;
  plyrContainer.__jsdomMockClientWidth = 700;
  container.appendChild(plyrContainer);

  const progress = document.createElement('div') as any;
  progress.classList.add('progress');
  (progress as any).setBoundingClientRect({
    top: 500,
    left: 50,
    width: 100,
  } as ClientRect);
  plyrContainer.appendChild(progress);

  plyr = new Plyr();
  plyr.elements.container = plyrContainer;
  plyr.elements.progress = progress;
});

describe('Feature Enabling', () => {
  it('is false if the option is disabled', () => {
    expect(
      SeekPreview.canBeEnabled(
        { elements: { container: { clientWidth: 500 } } },
        PlaybackFactory.streamSample(),
        {
          controls: ['progress'],
          addons: { seekPreview: false },
        },
      ),
    ).toEqual(false);
  });

  it('is false if the container is too small', () => {
    expect(
      SeekPreview.canBeEnabled(
        { elements: { container: { clientWidth: 400 } } },
        PlaybackFactory.streamSample({
          links: {
            videoPreview: new Link({
              href: 'http://path/to/thumbnail/api',
              templated: true,
            }),
          } as Playback['links'],
        }),
        {
          controls: ['progress'],
          addons: { seekPreview: true },
        },
      ),
    ).toEqual(false);
  });

  it('is false if the playback has no videoPreview', () => {
    const playback = PlaybackFactory.streamSample();

    delete playback.links.videoPreview;

    expect(
      SeekPreview.canBeEnabled(
        { elements: { container: { clientWidth: 500 } } },
        playback,
        {
          controls: ['progress'],
          addons: { seekPreview: true },
        },
      ),
    ).toEqual(false);
  });

  it('is false if there is no playback', () => {
    expect(
      SeekPreview.canBeEnabled(
        { elements: { container: { clientWidth: 500 } } },
        null,
        {
          controls: ['progress'],
          addons: { seekPreview: true },
        },
      ),
    ).toEqual(false);
  });

  it('is false if the controls do not contain a progress bar', () => {
    expect(
      SeekPreview.canBeEnabled(
        { elements: { container: { clientWidth: 500 } } },
        PlaybackFactory.streamSample(),
        {
          controls: [],
          addons: { seekPreview: true },
        },
      ),
    ).toEqual(false);
  });

  it('is true if the playback has a videoPreview link, and controls have a progressbar, and the option is enabled', () => {
    expect(
      SeekPreview.canBeEnabled(
        { elements: { container: { clientWidth: 500 } } },
        PlaybackFactory.streamSample({
          links: {
            videoPreview: new Link({
              href: 'http://path/to/thumbnail/api',
              templated: true,
            }),
          } as Playback['links'],
        }),
        {
          controls: ['progress'],
          addons: { seekPreview: true },
        },
      ),
    ).toEqual(true);
  });
});

describe('Options', () => {
  const testData = [
    {
      message: 'default when input is true',
      input: true,
      expected: defaultSeekPreviewOptions,
    },
    {
      message: 'as specified when input is within limits',
      input: {
        frameCount: 10,
      },
      expected: {
        frameCount: 10,
      },
    },
    {
      message: 'upper bound when input is above upper bound',
      input: {
        frameCount: 100,
      },
      expected: {
        frameCount: 20,
      },
    },
    {
      message: 'lower bound when input is below lower bound',
      input: {
        frameCount: -10,
      },
      expected: {
        frameCount: 10,
      },
    },
  ];

  testData.forEach(({ message, input, expected }) => {
    it(`is set to ${message}`, () => {
      const addon = new SeekPreview(plyr, PlaybackFactory.streamSample(), {
        controls: null,
        addons: { seekPreview: input },
      });

      expect(addon.getOptions()).toEqual(expected);
    });
  });
});

describe('Usage', () => {
  const createSeekPreview = (seekPreviewOptions?: SeekPreviewOptions) =>
    new SeekPreview(
      plyr,
      PlaybackFactory.streamSample({
        duration: 100,
        links: {
          videoPreview: new Link({
            href:
              'http://path/to/thumbnail/api/slices/{thumbnailCount}/width/{thumbnailWidth}',
            templated: true,
          }),
          thumbnail: new Link({
            href: 'http://path/to/thumbnail/api/width/{thumbnailWidth}',
            templated: true,
          }),
        } as Playback['links'],
      }),
      {
        addons: {
          seekPreview: seekPreviewOptions || true,
        },
      } as InterfaceOptions,
    );

  it('loads a placeholder image while loading the larger image', () => {
    createSeekPreview();

    const img: HTMLImageElement = plyr.elements.container.querySelector(
      '.seek-thumbnail__image--placeholder',
    );
    expect(img).toBeTruthy();

    expect(img.src).toEqual('http://path/to/thumbnail/api/width/700');
  });

  it('loads the image as soon as it is instantiated', () => {
    createSeekPreview();

    const img: HTMLImageElement = plyr.elements.container.querySelector(
      '.seek-thumbnail__image',
    );
    expect(img).toBeTruthy();

    expect(img.src).toEqual('http://path/to/thumbnail/api/slices/15/width/175');
  });

  it('Renders a thumbnail container above the cursor when mousemove on Plyr progress bar', () => {
    createSeekPreview();

    const mousemoveListeners =
      plyr.elements.progress.__eventListeners.mousemove;
    expect(mousemoveListeners).toHaveLength(1);

    const mousemoveListener = mousemoveListeners[0];

    mousemoveListener({ pageX: 30 });

    const previewContainer: HTMLElement = plyr.elements.container.querySelector(
      '.seek-thumbnail',
    );
    expect(previewContainer).toBeTruthy();

    expect(previewContainer.style.left).toEqual('-20px');
  });

  it('Renders the correct image within the container', () => {
    createSeekPreview();

    const mousemoveListeners =
      plyr.elements.progress.__eventListeners.mousemove;
    expect(mousemoveListeners).toHaveLength(1);

    const mousemoveListener = mousemoveListeners[0];

    mousemoveListener({ pageX: 30 });

    const previewContainer: HTMLElement = plyr.elements.container.querySelector(
      '.seek-thumbnail',
    );
    expect(previewContainer).toBeTruthy();

    const img: HTMLImageElement = previewContainer.querySelector('img');

    expect(img).toBeTruthy();

    expect(img.src).toEqual('http://path/to/thumbnail/api/slices/15/width/175');
  });

  it('Accepts a different slice count via options', () => {
    createSeekPreview({ frameCount: 18 });

    const mousemoveListeners =
      plyr.elements.progress.__eventListeners.mousemove;
    expect(mousemoveListeners).toHaveLength(1);

    const mousemoveListener = mousemoveListeners[0];

    mousemoveListener({ pageX: 30 });

    const previewContainer: HTMLElement = plyr.elements.container.querySelector(
      '.seek-thumbnail',
    );
    expect(previewContainer).toBeTruthy();

    const img: HTMLImageElement = previewContainer.querySelector('img');

    expect(img).toBeTruthy();

    expect(img.src).toEqual('http://path/to/thumbnail/api/slices/18/width/175');
  });

  describe('Image position and Time label', () => {
    /**
     * Given:
     * - The bar starts at 50px
     * - The bar is 100px long
     * - Duration is 100 seconds
     * - There are 10 slices in the bar
     *
     * Therefore each 10 pixels is equal to a slice, each pixel is a second
     */
    const testData = [
      {
        cursorX: 40,
        expectedSlice: 0,
        expectedTime: '0:00',
      },
      {
        cursorX: 55,
        expectedSlice: 0,
        expectedTime: '0:05',
      },
      {
        cursorX: 65,
        expectedSlice: 1,
        expectedTime: '0:15',
      },
      {
        cursorX: 75,
        expectedSlice: 2,
        expectedTime: '0:25',
      },
      {
        cursorX: 85,
        expectedSlice: 3,
        expectedTime: '0:35',
      },
      {
        cursorX: 125,
        expectedSlice: 7,
        expectedTime: '1:15',
      },
      {
        cursorX: 135,
        expectedSlice: 8,
        expectedTime: '1:25',
      },
      {
        cursorX: 145,
        expectedSlice: 9,
        expectedTime: '1:35',
      },
      {
        cursorX: 155,
        expectedSlice: 9,
        expectedTime: '1:40',
      },
    ];

    testData.forEach(({ cursorX, expectedSlice, expectedTime }) => {
      it(`Renders slice ${expectedSlice} when the cursor is at ${cursorX}px`, () => {
        createSeekPreview({ frameCount: 10 });

        const mousemoveListeners =
          plyr.elements.progress.__eventListeners.mousemove;
        expect(mousemoveListeners).toHaveLength(1);

        const mousemoveListener = mousemoveListeners[0];
        mousemoveListener({ pageX: cursorX });

        const img: HTMLImageElement = plyr.elements.container.querySelector(
          '.seek-thumbnail img',
        );

        expect(img).toBeTruthy();
        expect(img.style.left).toEqual(
          Math.ceil(700 * 0.25) * expectedSlice * -1 + 'px',
        );

        const label: HTMLSpanElement = plyr.elements.container.querySelector(
          '.seek-thumbnail .seek-thumbnail__time',
        );
        expect(label).toBeTruthy();
        expect(label.textContent).toEqual(expectedTime);
      });
    });
  });

  it('hides the thumbnail on mouse out', () => {
    createSeekPreview();

    const mouseoutListeners = plyr.elements.progress.__eventListeners.mouseout;
    expect(mouseoutListeners).toHaveLength(1);

    const mouseoutListener = mouseoutListeners[0];

    mouseoutListener({});

    const hiddenContainer: HTMLElement = plyr.elements.container.querySelector(
      '.seek-thumbnail--hidden',
    );

    expect(hiddenContainer).toBeTruthy();
  });

  describe('events', () => {
    it('resets itself on enterfullscreen', () => {
      plyr.elements.container.__jsdomMockClientWidth = 700;

      createSeekPreview();

      const seekPreviewContainer = container.querySelector(
        '.seek-thumbnail',
      ) as HTMLElement;

      expect(seekPreviewContainer).toBeTruthy();
      expect(seekPreviewContainer.style.width).toEqual(`${700 * 0.25}px`);

      plyr.elements.container.__jsdomMockClientWidth = 1400;

      plyr.__callEventCallback('enterfullscreen');

      const seekPreviewContainerAfter = container.querySelector(
        '.seek-thumbnail',
      ) as HTMLElement;

      expect(seekPreviewContainerAfter).toBeTruthy();
      expect(seekPreviewContainerAfter.style.width).toEqual(`${1400 * 0.25}px`);
    });

    it('resets itself on exitfullscreen', () => {
      plyr.elements.container.__jsdomMockClientWidth = 1400;

      createSeekPreview();

      const seekPreviewContainer = container.querySelector(
        '.seek-thumbnail',
      ) as HTMLElement;

      expect(seekPreviewContainer).toBeTruthy();
      expect(seekPreviewContainer.style.width).toEqual(`${1400 * 0.25}px`);

      plyr.elements.container.__jsdomMockClientWidth = 700;

      plyr.__callEventCallback('exitfullscreen');

      const seekPreviewContainerAfter = container.querySelector(
        '.seek-thumbnail',
      ) as HTMLElement;

      expect(seekPreviewContainerAfter).toBeTruthy();
      expect(seekPreviewContainerAfter.style.width).toEqual(`${700 * 0.25}px`);
    });
  });
});
