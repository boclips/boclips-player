import { BoclipsPlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { PlayerLibrary } from '../Player/Player';

export class BoclipsPlayerFactory {
  private static playerLibrary: PlayerLibrary = {
    initialise: console.log,
  };

  public static initialise(container: HTMLElement) {
    const boclipsPlayer = new BoclipsPlayer(
      BoclipsPlayerFactory.playerLibrary,
      container,
    );
    boclipsPlayer.initialise();
    return boclipsPlayer;
  }
}
