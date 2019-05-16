import Plyr from 'plyr';

import 'plyr/dist/plyr.css';
import { Source, Wrapper } from './Wrapper';

import Hls from 'hls.js';
import { EventTracker } from '../Analytics/EventTracker';

export default class PlyrWrapper implements Wrapper {
  private readonly plyr;
  private hls = null;

  constructor(element: HTMLElement) {
    this.plyr = new Plyr(element, {
      debug: process.env.NODE_ENV !== 'production',
    });

    this.plyr.on('play', () => {
      if (this.hls) {
        this.hls.startLoad();
      }
    });
  }

  set source(newSources: Source) {
    this.plyr.source = newSources;

    if (Hls.isSupported()) {
      this.hls = new Hls({
        debug: process.env.NODE_ENV !== 'production',
      });
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

  public installEventTracker = (eventTracker: EventTracker) => {
    this.plyr.on('playing', event => {
      eventTracker.handlePlay(event.detail.plyr.currentTime);
    });
    this.plyr.on('pause', event => {
      eventTracker.handlePause(event.detail.plyr.currentTime);
    });
  };
}
