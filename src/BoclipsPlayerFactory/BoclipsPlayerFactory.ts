import { BoclipsPlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { ProviderFactory } from '../Provider/ProviderFactory';

export const get = (
  container: HTMLElement,
  options: BoclipsPlayerOptions = {},
): BoclipsPlayer => {
  const Provider = ProviderFactory.get();
  return new BoclipsPlayer(Provider, container, options);
};
