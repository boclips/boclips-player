import Plyr from 'plyr';

import 'plyr/dist/plyr.css';
import { Provider, Source } from './Provider';

import Hls from 'hls.js';

export default class PlyrWrapper implements Provider {
  private readonly plyr;
  private hls = null;

  constructor(element: HTMLElement) {
    this.plyr = new Plyr(element, { debug: true });

    this.plyr.on('play', () => {
      if (this.hls) {
        this.hls.startLoad();
      }
    });
  }

  set source(newSources: Source) {
    this.plyr.source = newSources;

    if (Hls.isSupported()) {
      this.hls = new Hls({ debug: true });
      this.hls.attachMedia(this.plyr.media);
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls.loadSource(newSources.sources[0].src);
      });
    }
  }

  get source(): Source {
    return this.plyr.source;
  }

  public play = (): Promise<void> => {
    return this.plyr.play();
  };

  public pause = (): void => {
    this.plyr.pause();
  };
}
