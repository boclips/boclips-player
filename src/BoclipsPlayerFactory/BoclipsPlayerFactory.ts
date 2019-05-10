import { BoclipsPlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { ProviderFactory } from '../Provider/ProviderFactory';

export class BoclipsPlayerFactory {
  public static get(container: HTMLElement): BoclipsPlayer {
    const Provider = ProviderFactory.get();
    return new BoclipsPlayer(Provider, container);
  }
}
