import { GeneralButton } from './GeneralButton';
import { MockedPlyr } from '../../../../../__mocks__/plyr';
import Plyr from 'plyr';

describe('Feature Enabling', () => {
  it('is not enabled when turned off', () => {
    const canBeEnabled = GeneralButton.canBeEnabled(null, null, {
      controls: [],
      addons: { generalButtons: null },
    });

    expect(canBeEnabled).toBe(false);
  });
  it('is not enabled when not specified in addonds', () => {
    const canBeEnabled = GeneralButton.canBeEnabled(null, null, {
      controls: [],
      addons: { seekPreview: true },
    });
    expect(canBeEnabled).toBe(false);
  });

  it('is not enabled when the restart control is being used', () => {
    const canBeEnabled = GeneralButton.canBeEnabled(null, null, {
      controls: ['restart'],
      addons: {
        generalButtons: [
          {
            child: '<h1>Test</h1>',
            onClick: () => {
              console.log('yay');
            },
          },
        ],
      },
    });

    expect(canBeEnabled).toBe(false);
  });
  it('is not enabled when empty array is passed in', () => {
    const canBeEnabled = GeneralButton.canBeEnabled(null, null, {
      controls: [],
      addons: {
        generalButtons: [],
      },
    });

    expect(canBeEnabled).toBe(false);
  });

  it('is enabled when specified in options', () => {
    const canBeEnabled = GeneralButton.canBeEnabled(null, null, {
      controls: [],
      addons: {
        generalButtons: [
          {
            child: '<h1>Test</h1>',
            onClick: () => {
              console.log('yay');
            },
          },
        ],
      },
    });

    expect(canBeEnabled).toBeTruthy();
  });
});

describe('options functionality', () => {
  let plyr: MockedPlyr;
  let container: HTMLDivElement;
  const mockOnPlay = jest.fn();

  beforeEach(() => {
    container = document.createElement('div') as any;

    const plyrContainer = document.createElement('div') as any;
    plyrContainer.__jsdomMockClientWidth = 700;
    container.appendChild(plyrContainer);

    plyr = new Plyr(plyrContainer) as MockedPlyr;

    plyr.elements.container = plyrContainer;
    // tslint:disable-next-line: no-unused-expression
    const child = document.createElement('div');

    child.innerHTML = 'Share';
    // tslint:disable-next-line: no-unused-expression
    new GeneralButton(plyr, null, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'fullscreen',
      ],
      addons: {
        seekPreview: true,
        hoverPreview: false,
        singlePlayback: true,
        rewatchButton: false,
        generalButtons: [
          {
            child,
            onClick: () => {
              mockOnPlay();
            },
          },
        ],
      },
    });
  });
  it('shows generalbutton at the end of the video', () => {
    plyr.__callEventCallback('ended');
    const overlay = container
      .getElementsByTagName('button')
      .namedItem('overlay');
    console.log(overlay.innerHTML);
    expect(overlay.innerHTML.includes('Share')).toBeTruthy();
  });
  it('button onclick executes passed in function', () => {
    plyr.__callEventCallback('ended');
    const buttons: HTMLButtonElement[] = Array.from(
      container.getElementsByTagName('button'),
    );
    const generalButtons = [];

    buttons.forEach(elements => {
      if (elements.innerHTML.includes('icons-container')) {
        generalButtons.push(elements);
      }
    });
    buttons.forEach(elements => {
      elements.click();
    });
    expect(mockOnPlay).toHaveBeenCalledTimes(generalButtons.length);
  });
});
