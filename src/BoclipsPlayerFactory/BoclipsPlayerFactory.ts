import { BoclipsPlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { WrapperFactory } from '../Wrapper/WrapperFactory';

export const get = (
  container: HTMLElement | string,
  options: BoclipsPlayerOptions = {},
): BoclipsPlayer => {
  const Wrapper = WrapperFactory.get();
  if (typeof container === 'string') {
    container = document.querySelector(container) as HTMLElement;
  }
  if (!container) {
    return null;
  }

  if (container.getAttribute('data-boclips-player-initialised')) {
    return null;
  }

  container.setAttribute('data-boclips-player-initialised', 'true');

  return new BoclipsPlayer(Wrapper, container, options);
};

export const getSeveral = (
  containers: Array<HTMLElement | string> | string,
): BoclipsPlayer[] => {
  let players = [];

  if (typeof containers === 'string') {
    const queryResult = document.querySelectorAll(containers);
    // tslint:disable-next-line prefer-for-of as it doesn't work on NodeList..
    for (let index = 0; index < queryResult.length; ++index) {
      players.push(get(queryResult[index] as HTMLElement));
    }
  } else {
    players = containers.map(container => get(container));
  }

  return players.filter(player => !!player);
};

export const scan = (): BoclipsPlayer[] => {
  return getSeveral('[data-boclips-player-container]');
};
