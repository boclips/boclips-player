import { ProviderConstructor } from '../Provider/Provider';
import { MockProvider } from '../test-support/MockProvider';
import { BoclipsPlayer } from './BoclipsPlayer';

describe('BoclipsPlayer', () => {
  const providerConstructor = MockProvider;
  let element: HTMLElement;
  let player: BoclipsPlayer;

  beforeEach(() => {
    element = document.createElement('div');
    player = new BoclipsPlayer(
      providerConstructor as ProviderConstructor,
      element,
    );
  });

  it('Constructs a new player when passed an element', () => {
    expect(player).not.toBeNull();
  });

  it('Will return the container', () => {
    expect(player.getContainer()).toEqual(element);
  });

  it('Will return the provider', () => {
    expect(player.getProvider().play).toBeTruthy();
  });

  it('Will insert a video element into the container', () => {
    expect(element.children.length).toEqual(1);
    const child = element.children.item(0);
    expect(child.tagName).toEqual('VIDEO');
    expect(child.getAttribute('data-qa')).toEqual('boclips-player');
  });

  it('Will initialise the video element with the player', () => {
    expect(providerConstructor).toBeCalledTimes(1);
    expect(providerConstructor).toHaveBeenCalledWith(element.children.item(0));
  });
});
