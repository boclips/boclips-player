import { BoclipsPlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { WrapperFactory } from '../Wrapper/WrapperFactory';

export const get = (
  container: HTMLElement,
  options: BoclipsPlayerOptions = {},
): BoclipsPlayer => {
  const Wrapper = WrapperFactory.get();
  return new BoclipsPlayer(Wrapper, container, options);
};
