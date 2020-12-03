import {
  BoclipsPlayer,
  PrivatePlayer,
} from '../../BoclipsPlayer/BoclipsPlayer';
import { NullLogger } from '../../NullLogger';

jest.mock('../../Events/Analytics');
jest.unmock('plyr');

let container: HTMLElement = null;
let player: PrivatePlayer;

describe('Emitting interaction events', () => {
  const testData = [
    {
      when: 'fast forward is pressed',
      controls: ['fast-forward'],
      dataAttribute: 'fast-forward',
      expectedType: 'jumpedForward',
      expectedPayload: {},
    },
    {
      when: 'rewind is pressed',
      controls: ['rewind'],
      dataAttribute: 'rewind',
      expectedType: 'jumpedBackward',
      expectedPayload: {},
    },
  ];

  testData.forEach((data) => {
    it(`emits an interaction event when ${data.when}`, () => {
      container = document.createElement('div');
      document.body.appendChild(container);

      player = new BoclipsPlayer(container, new NullLogger(), {
        interface: { controls: data.controls as any },
      });

      expect(container.children.length).toEqual(1);

      const button: HTMLElement = container.querySelector(
        `[data-plyr="${data.dataAttribute}"]`,
      );

      expect(button).toBeTruthy();

      button.click();

      expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
        0,
        data.expectedType,
        data.expectedPayload,
      );
    });
  });

  it(`emits an interaction event when muted`, () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    player = new BoclipsPlayer(container, new NullLogger(), {
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

    player = new BoclipsPlayer(container, new NullLogger(), {
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
