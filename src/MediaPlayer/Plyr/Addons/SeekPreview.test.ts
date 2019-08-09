import { PlaybackFactory } from '../../../test-support/TestFactories';
import { HasEventListeners } from '../../../test-support/types';
import { Link } from '../../../types/Link';
import { Playback } from '../../../types/Playback';
import { SeekPreview } from './SeekPreview';

describe('Feature Enabling', () => {
  it('is false if the option is disabled', () => {
    expect(
      SeekPreview.canBeEnabled(PlaybackFactory.streamSample(), {
        controls: ['progress'],
        seekPreview: false,
      }),
    ).toEqual(false);
  });

  it('is false if the playback has no thumbnailApi', () => {
    expect(
      SeekPreview.canBeEnabled(PlaybackFactory.streamSample(), {
        controls: ['progress'],
        seekPreview: false,
      }),
    ).toEqual(false);
  });

  it('is false if there is no playback', () => {
    expect(
      SeekPreview.canBeEnabled(null, {
        controls: ['progress'],
        seekPreview: false,
      }),
    ).toEqual(false);
  });

  it('is false if the controls do not contain a progress bar', () => {
    expect(
      SeekPreview.canBeEnabled(PlaybackFactory.streamSample(), {
        controls: [],
        seekPreview: true,
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
          seekPreview: true,
        },
      ),
    ).toEqual(true);
  });
});

describe('Usage', () => {
  let progress: HTMLDivElement & HasEventListeners;
  let plyr: {
    elements: { progress: HTMLDivElement };
  };

  beforeEach(() => {
    progress = document.createElement('div') as any;

    (progress as any).setBoundingClientRect({
      top: 500,
      left: 50,
      width: 100,
    } as ClientRect);

    document.body.appendChild(progress);

    plyr = { elements: { progress } };
  });

  const createSeekPreview = () =>
    new SeekPreview(
      plyr,
      PlaybackFactory.streamSample({
        links: {
          thumbnailApi: new Link({
            href: 'http://path/to/thumbnail/api',
            templated: true,
          }),
        } as Playback['links'],
      }),
    );

  it('Renders a thumbnail container above the cursor when mousemove on Plyr progress bar', () => {
    createSeekPreview();

    const mousemoveListeners = progress.__eventListeners.mousemove;
    expect(mousemoveListeners).toHaveLength(1);

    const mousemoveListener = mousemoveListeners[0];

    mousemoveListener({ pageX: 30 });

    const container: HTMLElement = document.body.querySelector(
      '.seek-thumbnail',
    );
    expect(container).toBeTruthy();

    expect(container.style.left).toEqual('30px');
    expect(container.style.top).toEqual('325px');
  });

  it('Renders the correct image within the container', () => {
    createSeekPreview();

    const mousemoveListeners = progress.__eventListeners.mousemove;
    expect(mousemoveListeners).toHaveLength(1);

    const mousemoveListener = mousemoveListeners[0];

    mousemoveListener({ pageX: 30 });

    const container: HTMLElement = document.body.querySelector(
      '.seek-thumbnail',
    );
    expect(container).toBeTruthy();

    const img: HTMLImageElement = container.querySelector('img');

    expect(img).toBeTruthy();

    expect(img.src).toEqual('http://path/to/thumbnail/api');
  });

  describe('Image position', () => {
    /**
     * Given:
     * - The bar starts at 50px
     * - The bar is 100px long
     * - There are 10 slices in the bar
     *
     * Therefore each 10 pixels is equal to a slice.
     */
    const testData = [
      {
        cursorX: 40,
        expectedSlice: 0,
      },
      {
        cursorX: 55,
        expectedSlice: 0,
      },
      {
        cursorX: 65,
        expectedSlice: 1,
      },
      {
        cursorX: 75,
        expectedSlice: 2,
      },
      {
        cursorX: 85,
        expectedSlice: 3,
      },
      {
        cursorX: 145,
        expectedSlice: 8,
      },
      {
        cursorX: 1,
        expectedSlice: 9,
      },
    ];

    testData.forEach(({ cursorX, expectedSlice }) => {
      it(`Renders slice ${expectedSlice} when the cursor is at ${cursorX}px`, () => {
        createSeekPreview();

        const mousemoveListeners = progress.__eventListeners.mousemove;
        expect(mousemoveListeners).toHaveLength(1);

        const mousemoveListener = mousemoveListeners[0];
        mousemoveListener({ pageX: cursorX });

        const img: HTMLImageElement = document.body.querySelector(
          '.seek-thumbnail img',
        );

        expect(img).toBeTruthy();
        expect(img.style.left).toEqual(
          SeekPreview.CONTAINER_WIDTH * expectedSlice * -1 + 'px',
        );
      });
    });
  });
});
