import { GeneralButton } from './GeneralButton';
import { MockedPlyr } from '../../../../../__mocks__/plyr';
import Plyr from 'plyr';

describe('Feature Enabling', () => {
  it('is not enabled when turned off', () => {
    const canBeEnabled = GeneralButton.canBeEnabled(null, null, {
      controls: [],
      addons: { generalButton: null },
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
        generalButton: {
          child: '<h1>Test</h1>',
          onClick: () => {
            console.log('yay');
          },
        },
      },
    });

    expect(canBeEnabled).toBe(false);
  });

  it('it is enabled when turned on', () => {
    const canBeEnabled = GeneralButton.canBeEnabled(null, null, {
      controls: [],
      addons: {
        generalButton: {
          child: '<h1>Test</h1>',
          onClick: () => {
            console.log('yay');
          },
        },
      },
    });

    expect(canBeEnabled).toBeTruthy();
  });
});

describe('options functionality', () => {
  let plyr: MockedPlyr;
  let container: HTMLDivElement;

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
        generalButton: {
          child,
          onClick: () => {
            console.log('yay');
          },
        },
      },
    });
  });
  it('it shows generalbutton at the end of the video', () => {
    plyr.__callEventCallback('ended');

    expect(container.innerHTML.includes('Share'));
  });
  it('button onclick executes passed in function', () => {
    plyr.__callEventCallback('ended');

    const mockOnPlay = jest.fn();
    const button = container
      .getElementsByTagName('button')
      .namedItem('general-button') as HTMLButtonElement;
    console.log(button);
    button.click = mockOnPlay;

    button.click();

    expect(mockOnPlay).toHaveBeenCalledTimes(1);
  });
});
