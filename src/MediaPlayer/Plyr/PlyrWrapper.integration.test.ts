import {
  BoclipsPlayer,
  PrivatePlayer,
} from '../../BoclipsPlayer/BoclipsPlayer';

jest.mock('../../Events/Analytics');
jest.unmock('plyr');

let container: HTMLElement = null;
let player: PrivatePlayer;

describe('Emitting interaction events', () => {
  it(`emits an interaction event when fast forward is pressed`, () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    player = new BoclipsPlayer(container, {
      interface: { controls: ['fast-forward'] },
    });

    expect(container.children.length).toEqual(1);

    const button: HTMLElement = container.querySelector(
      `[data-plyr="fast-forward"]`,
    );

    expect(button).toBeTruthy();

    button.click();

    expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      0,
      'jumpedForward',
      {},
    );
  });

  it(`emits an interaction event when rewind is pressed`, () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    player = new BoclipsPlayer(container, {
      interface: { controls: ['rewind'] },
    });

    expect(container.children.length).toEqual(1);

    const button: HTMLElement = container.querySelector(`[data-plyr='rewind']`);

    expect(button).toBeTruthy();

    button.click();

    expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      0,
      'jumpedBackward',
      {},
    );
  });

  it(`emits an interaction event when muted`, () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    player = new BoclipsPlayer(container, {
      interface: { controls: ['mute'] },
    });

    expect(container.children.length).toEqual(1);

    const mute: HTMLElement = container.querySelector(`[data-plyr="mute"]`);

    expect(mute).toBeTruthy();

    mute.click();

    expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      0,
      'muted',
      {},
    );
  });

  it(`emits an interaction event when unmuted`, () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    player = new BoclipsPlayer(container, {
      interface: { controls: ['mute'] },
    });

    expect(container.children.length).toEqual(1);

    const mute: HTMLElement = container.querySelector(`[data-plyr="mute"]`);

    expect(mute).toBeTruthy();

    mute.click();
    mute.click();

    expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
      0,
      'unmuted',
      {},
    );
  });
});
