import {
  BoclipsPlayer,
  PrivatePlayer,
} from '../../BoclipsPlayer/BoclipsPlayer';
import { describe, expect, it, jest } from '@jest/globals';


jest.mock('../../Events/Analytics');
jest.unmock('plyr');

let container: HTMLElement = null;
let player: PrivatePlayer;

describe('player tab index', () => {
  it('play button is first child of parent element', () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    player = new BoclipsPlayer(container);

    const playButtonNode = document.querySelector('button').parentElement;

    expect(player.getContainer().children[0]).toBe(playButtonNode);
  });
});
