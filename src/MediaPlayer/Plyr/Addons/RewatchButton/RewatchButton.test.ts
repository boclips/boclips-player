import { RewatchButton } from './RewatchButton';
import { MockedPlyr } from '../../../../../__mocks__/plyr';
import Plyr from 'plyr';

describe('Feature Enabling', () => {
  it('is not enabled when turned off', () => {
    const canBeEnabled = RewatchButton.canBeEnabled(null, null, {
      controls: [],
      addons: { rewatchButton: false },
    });

    expect(canBeEnabled).toBe(false);
  });

  it('is not enabled when not specified in addonds', () => {
    const canBeEnabled = RewatchButton.canBeEnabled(null, null, {
      controls: [],
      addons: { seekPreview: true },
    });
    expect(canBeEnabled).toBe(false);
  });

  it('is not enabled when the restart control is being used', () => {
    const canBeEnabled = RewatchButton.canBeEnabled(null, null, {
      controls: ['restart'],
      addons: { rewatchButton: true },
    });

    expect(canBeEnabled).toBe(false);
  });

  it('it is enabled when turned on', () => {
    const canBeEnabled = RewatchButton.canBeEnabled(null, null, {
      controls: [],
      addons: { rewatchButton: true },
    });

    expect(canBeEnabled).toBeTruthy();
  });
});

describe('Rewatch Button', () => {
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
    new RewatchButton(plyr);
  });

  it('shows button at the end of a video', () => {
    plyr.__callEventCallback('ended');

    expect(container.innerHTML.includes('Watch Again')).toBeTruthy();
  });

  it('goes back to the start when button is clicked', () => {
    plyr.__callEventCallback('ended');

    const mockOnPlay = jest.fn();
    plyr.play = mockOnPlay;

    const rewatchButton = container
      .getElementsByTagName('button')
      .namedItem('replay-overlay-button') as HTMLButtonElement;

    rewatchButton.click();

    expect(mockOnPlay).toHaveBeenCalledTimes(1);
  });
  it('overlay container and button get destroyed', () => {
    plyr.__callEventCallback('ended');

    const rewatchOverlay = container
      .getElementsByTagName('button')
      .namedItem('replay-overlay') as HTMLButtonElement;

    const rewatchButton = container
      .getElementsByTagName('button')
      .namedItem('replay-overlay-button') as HTMLButtonElement;

    rewatchButton.click();

    expect(container).not.toContain(rewatchButton || rewatchOverlay);
  });
});
