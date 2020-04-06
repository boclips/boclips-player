import { BoclipsPlayerFactory } from './BoclipsPlayerFactory';

describe('getting a single player', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test';
    document.body.appendChild(container);
  });

  it('returns a single BoclipsPlayer when provided with a container element', () => {
    const player = BoclipsPlayerFactory.get(container);

    expect(player).toBeTruthy();
    expect(player.getContainer()).toEqual(container);
  });

  it('returns a single BoclipsPlayer when provided with a matching selector', () => {
    const player = BoclipsPlayerFactory.get('div#test');

    expect(player).toBeTruthy();
    expect(player.getContainer()).toEqual(container);
  });

  it('returns null when provided with a non-matching selector', () => {
    const player = BoclipsPlayerFactory.get('div#doesntexist');

    expect(player).toBeNull();
  });

  it('does not add re add a player to an element', () => {
    const player = BoclipsPlayerFactory.get('div#test');

    expect(player).toBeTruthy();
    expect(player.getContainer()).toEqual(container);

    const secondPlayer = BoclipsPlayerFactory.get('div#test');
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

  it('adds a data attribute to the container on creation', () => {
    const container = document.createElement('div');

    const player = BoclipsPlayerFactory.get(container);

    const updatedContainer = player.getContainer();
    expect(
      updatedContainer.getAttribute('data-boclips-player-initialised'),
    ).toBeTruthy();
  });

  it('removes data attribute to the container on destruction', () => {
    const container = document.createElement('div');

    const player = BoclipsPlayerFactory.get(container);
    player.destroy();

    const updatedContainer = player.getContainer();
    expect(
      updatedContainer.getAttribute('data-boclips-player-initialised'),
    ).toBeFalsy();
  });

  it('returns null when attempting to create a second player', () => {
    const container = document.createElement('div');

    const firstPlayer = BoclipsPlayerFactory.get(container);
    const secondPlayer = BoclipsPlayerFactory.get(container);

    expect(firstPlayer).not.toBeNull();
    expect(secondPlayer).toBeNull();
  });

  it('can create a new player after being destroyed', () => {
    const container = document.createElement('div');

    const firstPlayer = BoclipsPlayerFactory.get(container);
    firstPlayer.destroy();
    const secondPlayer = BoclipsPlayerFactory.get(container);

    expect(secondPlayer).not.toBeNull();
  });

  it('returns a BoclipsPlayer per container', () => {
    const players = BoclipsPlayerFactory.getSeveral(containers);

    expect(players).toHaveLength(2);

    expect(players[0].getContainer()).toEqual(containers[0]);
    expect(players[1].getContainer()).toEqual(containers[1]);
  });

  it('returns a BoclipsPlayer per container when provided with a matching selector', () => {
    const players = BoclipsPlayerFactory.getSeveral('div');

    expect(players).toHaveLength(2);
    expect(players[0].getContainer()).toEqual(containers[0]);
    expect(players[1].getContainer()).toEqual(containers[1]);
  });

  it('returns empty array when provided with a non-matching selector', () => {
    const players = BoclipsPlayerFactory.getSeveral([
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

    const players = BoclipsPlayerFactory.scan();

    expect(players).toHaveLength(2);
    expect(players[0].getContainer()).toEqual(autoElementOne);
    expect(players[1].getContainer()).toEqual(autoElementTwo);
  });
});
