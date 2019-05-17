import { get, getSeveral, scan } from './BoclipsPlayerFactory';

describe('getting a single player', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test';
    document.body.appendChild(container);
  });

  it('returns a single BoclipsPlayer when provided with a container element', () => {
    const player = get(container);

    expect(player).toBeTruthy();
    expect(player.getContainer()).toEqual(container);
  });

  it('returns a single BoclipsPlayer when provided with a matching selector', () => {
    const player = get('div#test');

    expect(player).toBeTruthy();
    expect(player.getContainer()).toEqual(container);
  });

  it('returns null when provided with a non-matching selector', () => {
    const player = get('div#doesntexist');

    expect(player).toBeNull();
  });

  it('does not add re add a player to an element', () => {
    const player = get('div#test');

    expect(player).toBeTruthy();
    expect(player.getContainer()).toEqual(container);

    const secondPlayer = get('div#test');
    expect(secondPlayer).toBeNull();
  });
});

describe('getting several players', () => {
  let containers: HTMLElement[];

  beforeEach(() => {
    const containerOne = document.createElement('div');
    containerOne.id = 'one';
    const containerTwo = document.createElement('div');
    containerTwo.id = 'two';

    document.body.appendChild(containerOne);
    document.body.appendChild(containerTwo);

    containers = [containerOne, containerTwo];
  });

  it('returns a BoclipsPlayer per container', () => {
    const players = getSeveral(containers);

    expect(players).toHaveLength(2);

    expect(players[0].getContainer()).toEqual(containers[0]);
    expect(players[1].getContainer()).toEqual(containers[1]);
  });

  it('returns a BoclipsPlayer per container when provided with a matching selector', () => {
    const players = getSeveral('div');

    expect(players).toHaveLength(2);
    expect(players[0].getContainer()).toEqual(containers[0]);
    expect(players[1].getContainer()).toEqual(containers[1]);
  });

  it('returns empty array when provided with a non-matching selector', () => {
    const players = getSeveral([
      'div.thatdoesntexist',
      'div.anotherthatdoesntexist',
    ]);

    expect(players).toHaveLength(0);
  });
});

describe('scanning for videos', () => {
  it('can find and initialise several players', () => {
    const autoElementOne = document.createElement('div');
    autoElementOne.setAttribute('data-boclips-player-container', 'true');
    document.body.appendChild(autoElementOne);

    const autoElementTwo = document.createElement('div');
    autoElementTwo.setAttribute('data-boclips-player-container', 'true');
    document.body.appendChild(autoElementTwo);

    const players = scan();

    expect(players).toHaveLength(2);
    expect(players[0].getContainer()).toEqual(autoElementOne);
    expect(players[1].getContainer()).toEqual(autoElementTwo);
  });
});
