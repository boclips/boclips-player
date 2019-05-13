import Plyr from 'plyr';

import 'plyr/dist/plyr.css';
import { Provider, Source } from './Provider';

export default class PlyrWrapper implements Provider {
  private readonly plyr;
  constructor(element: HTMLElement) {
    this.plyr = new Plyr(element);
  }

  set source(newSources: Source) {
    this.plyr.source = newSources;
  }

  get source(): Source {
    return this.plyr.source;
  }

  public play = () => {
    this.plyr.play();
  };
}
