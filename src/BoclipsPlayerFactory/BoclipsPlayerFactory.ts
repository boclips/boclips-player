import { BoclipsPlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { BoclipsPlayerOptions } from '../BoclipsPlayer/BoclipsPlayerOptions';
import { WrapperFactory } from '../Wrapper/WrapperFactory';

export class BoclipsPlayerFactory {
  public static get(
    container: HTMLElement | string,
    options: Partial<BoclipsPlayerOptions> = {},
  ): BoclipsPlayer {
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
  }

  public static getSeveral(
    containers: Array<HTMLElement | string> | string,
  ): BoclipsPlayer[] {
    let players = [];

    if (typeof containers === 'string') {
      const queryResult = document.querySelectorAll(containers);
      // tslint:disable-next-line prefer-for-of as it doesn't work on NodeList..
      for (let index = 0; index < queryResult.length; ++index) {
        players.push(
          BoclipsPlayerFactory.get(queryResult[index] as HTMLElement),
        );
      }
    } else {
      players = containers.map(container =>
        BoclipsPlayerFactory.get(container),
      );
    }

    return players.filter(player => !!player);
  }

  public static scan(): BoclipsPlayer[] {
    return BoclipsPlayerFactory.getSeveral('[data-boclips-player-container]');
  }
}
