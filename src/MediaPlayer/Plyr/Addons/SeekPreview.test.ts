import { PlaybackFactory } from '../../../test-support/TestFactories';
import { HasEventListeners } from '../../../test-support/types';
import { Link } from '../../../types/Link';
import { Playback } from '../../../types/Playback';
import { InterfaceOptions } from '../../InterfaceOptions';
import { SeekPreview, SeekPreviewOptions } from './SeekPreview';

describe('Feature Enabling', () => {
  it('is false if the option is disabled', () => {
    expect(
      SeekPreview.canBeEnabled(PlaybackFactory.streamSample(), {
        controls: ['progress'],
        addons: { seekPreview: false },
      }),
    ).toEqual(false);
  });

  it('is false if the playback has no thumbnailApi', () => {
    expect(
      SeekPreview.canBeEnabled(PlaybackFactory.streamSample(), {
        controls: ['progress'],
        addons: { seekPreview: true },
      }),
    ).toEqual(false);
  });

  it('is false if there is no playback', () => {
    expect(
      SeekPreview.canBeEnabled(null, {
        controls: ['progress'],
        addons: { seekPreview: true },
      }),
    ).toEqual(false);
  });

  it('is false if the controls do not contain a progress bar', () => {
    expect(
      SeekPreview.canBeEnabled(PlaybackFactory.streamSample(), {
        controls: [],
        addons: { seekPreview: true },
      }),
    ).toEqual(false);
  });

  it('is true if the playback has a thumbnailApi link, and controls have a progressbar, and the option is enabled', () => {
    expect(
      SeekPreview.canBeEnabled(
        PlaybackFactory.streamSample({
          links: {
            thumbnailApi: new Link({
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

describe('Usage', () => {
  let progress: HTMLDivElement & HasEventListeners;
  let parentContainer: HTMLDivElement;
  let plyrContainer: HTMLDivElement;
  let media: HTMLVideoElement;

  let plyr: {
    elements: { progress: HTMLDivElement; container: HTMLDivElement };
    media: HTMLVideoElement;
  };

  beforeEach(() => {
    progress = document.createElement('div') as any;
    parentContainer = document.createElement('div') as any;
    plyrContainer = document.createElement('div') as any;
    media = document.createElement('video');

    parentContainer.appendChild(plyrContainer);

    (progress as any).setBoundingClientRect({
      top: 500,
      left: 50,
      width: 100,
    } as ClientRect);

    plyrContainer.appendChild(progress);

    plyr = { elements: { progress, container: plyrContainer }, media };
  });

  const createSeekPreview = (seekPreviewOptions?: SeekPreviewOptions) =>
    new SeekPreview(
      {
        addons: {
          seekPreview: seekPreviewOptions || true,
        },
      } as InterfaceOptions,
      plyr,
      PlaybackFactory.streamSample({
        duration: 100,
        links: {
          thumbnailApi: new Link({
            href:
              'http://path/to/thumbnail/api/slices/{videoSlices}/width/{thumbnailWidth}',
            templated: true,
          }),
        } as Playback['links'],
      }),
    );

  it('loads the image as soon as it is instantiated', () => {
    createSeekPreview();

    const img: HTMLImageElement = plyrContainer.querySelector(
      '.seek-thumbnail__image',
    );
    expect(img).toBeTruthy();

    expect(img.src).toEqual('http://path/to/thumbnail/api/slices/15/width/175');
  });

  it('Renders a thumbnail container above the cursor when mousemove on Plyr progress bar', () => {
    createSeekPreview();

    const mousemoveListeners = progress.__eventListeners.mousemove;
    expect(mousemoveListeners).toHaveLength(1);

    const mousemoveListener = mousemoveListeners[0];

    mousemoveListener({ pageX: 30 });

    const container: HTMLElement = plyrContainer.querySelector(
      '.seek-thumbnail',
    );
    expect(container).toBeTruthy();

    expect(container.style.left).toEqual('-20px');
  });

  it('Renders the correct image within the container', () => {
    createSeekPreview();

    const mousemoveListeners = progress.__eventListeners.mousemove;
    expect(mousemoveListeners).toHaveLength(1);

    const mousemoveListener = mousemoveListeners[0];

    mousemoveListener({ pageX: 30 });

    const container: HTMLElement = plyrContainer.querySelector(
      '.seek-thumbnail',
    );
    expect(container).toBeTruthy();

    const img: HTMLImageElement = container.querySelector('img');

    expect(img).toBeTruthy();

    expect(img.src).toEqual('http://path/to/thumbnail/api/slices/15/width/175');
  });

  it('Accepts a different slice count via options', () => {
    createSeekPreview({ sliceCount: 50 });

    const mousemoveListeners = progress.__eventListeners.mousemove;
    expect(mousemoveListeners).toHaveLength(1);

    const mousemoveListener = mousemoveListeners[0];

    mousemoveListener({ pageX: 30 });

    const container: HTMLElement = plyrContainer.querySelector(
      '.seek-thumbnail',
    );
    expect(container).toBeTruthy();

    const img: HTMLImageElement = container.querySelector('img');

    expect(img).toBeTruthy();

    expect(img.src).toEqual('http://path/to/thumbnail/api/slices/50/width/175');
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
        createSeekPreview({ sliceCount: 10 });

        const mousemoveListeners = progress.__eventListeners.mousemove;
        expect(mousemoveListeners).toHaveLength(1);

        const mousemoveListener = mousemoveListeners[0];
        mousemoveListener({ pageX: cursorX });

        const img: HTMLImageElement = plyrContainer.querySelector(
          '.seek-thumbnail img',
        );

        expect(img).toBeTruthy();
        expect(img.style.left).toEqual(
          SeekPreview.CONTAINER_WIDTH * expectedSlice * -1 + 'px',
        );

        const label: HTMLSpanElement = plyrContainer.querySelector(
          '.seek-thumbnail .seek-thumbnail__time',
        );
        expect(label).toBeTruthy();
        expect(label.textContent).toEqual(expectedTime);
      });
    });
  });

  it('hides the thumbnail on mouse out', () => {
    createSeekPreview();

    const mouseoutListeners = progress.__eventListeners.mouseout;
    expect(mouseoutListeners).toHaveLength(1);

    const mouseoutListener = mouseoutListeners[0];

    mouseoutListener({});

    const container: HTMLElement = plyrContainer.querySelector(
      '.seek-thumbnail--hidden',
    );

    expect(container).toBeTruthy();
  });
});
