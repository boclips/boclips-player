import { MockPlayerLibrary } from '../Player/MockPlayerLibrary';
import { PlayerLibrary } from '../Player/Player';
import { BoclipsPlayer } from './BoclipsPlayer';

describe('BoclipsPlayer', () => {
  let playerLibrary: PlayerLibrary;
  let element: HTMLElement;
  let player: BoclipsPlayer;

  beforeEach(() => {
    playerLibrary = MockPlayerLibrary.mock();
    element = document.createElement('div');
    player = new BoclipsPlayer(playerLibrary, element);
  });

  it('Constructs a new player when passed an element', () => {
    expect(player).not.toBeNull();
  });

  it('Will return the container', () => {
    expect(player.getContainer()).toEqual(element);
  });

  it('Will insert a video element into the container', () => {
    player.initialise();

    expect(element.children.length).toEqual(1);
    const child = element.children.item(0);
    expect(child.tagName).toEqual('VIDEO');
    expect(child.getAttribute('data-qa')).toEqual('boclips-player');
  });

  it('Will initialise the video element with the player', () => {
    player.initialise();

    expect(playerLibrary.initialise).toBeCalledTimes(1);
    expect(playerLibrary.initialise).toHaveBeenCalledWith(
      element.children.item(0),
    );
  });
});
