import { BoclipsPlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { PlayerOptions } from '../BoclipsPlayer/PlayerOptions';
import { Constants } from '../BoclipsPlayer/Constants';
import { Logger } from '../Logger';
import { ConsoleLogger } from '../ConsoleLogger';

export class BoclipsPlayerFactory {
  public static get(
    container: HTMLElement | string,
    options: Partial<PlayerOptions> = {},
    logger: Logger = new ConsoleLogger(),
  ): BoclipsPlayer {
    if (typeof container === 'string') {
      container = document.querySelector(container) as HTMLElement;
    }
    if (!container) {
      return null;
    }

    if (container.getAttribute(Constants.BOCLIPS_PLAYER_INTIALISED_ATTRIBUTE)) {
      return null;
    }

    container.setAttribute(
      Constants.BOCLIPS_PLAYER_INTIALISED_ATTRIBUTE,
      'true',
    );

    return new BoclipsPlayer(container, options, logger);
  }

  public static getSeveral(
    containers: (HTMLElement | string)[] | string,
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
      players = containers.map((container) =>
        BoclipsPlayerFactory.get(container),
      );
    }

    return players.filter((player) => !!player);
  }

  public static scan(): BoclipsPlayer[] {
    return BoclipsPlayerFactory.getSeveral('[data-boclips-player-container]');
  }
}
