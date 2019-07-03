import {
  BoclipsPlayer,
  PrivatePlayer,
} from '../../BoclipsPlayer/BoclipsPlayer';

jest.mock('../../Events/Analytics');
jest.unmock('plyr');

let container: HTMLElement = null;
let player: PrivatePlayer;

it('Emits an interaction event when fast forward is pressed', () => {
  container = document.createElement('div');
  document.body.appendChild(container);

  player = new BoclipsPlayer(container, {
    interface: { controls: ['fast-forward'] },
  });

  expect(container.children.length).toEqual(1);

  const fastForward: HTMLElement = container.querySelector(
    '[data-plyr="fast-forward"]',
  );

  expect(fastForward).toBeTruthy();

  fastForward.click();

  expect(player.getAnalytics().handleInteraction).toHaveBeenCalledWith(
    0,
    'fast-forward',
    {},
  );
});

