import { parse, toSeconds } from 'iso8601-duration';
import Plyr from 'plyr';
import { Wrapper } from '../Wrapper';
import './PlyrWrapper.less';

import Hls from 'hls.js';
import { addListener as addResizeListener } from 'resize-detector';
import { Analytics } from '../../Events/Analytics';
import {
  isStreamPlayback,
  Playback,
  StreamPlayback,
  YoutubePlayback,
} from '../../types/Playback';
import { Video } from '../../types/Video';
import { defaultOptions, WrapperOptions } from '../WrapperOptions';

export default class PlyrWrapper implements Wrapper {
  private plyr;
  private hls = null;
  private options: WrapperOptions;
  private hasBeenDestroyed: boolean = false;

  // @ts-ignore
  constructor(
    private readonly container: HTMLElement,
    private readonly analytics: Analytics,
    options: Partial<WrapperOptions> = {},
  ) {
    this.options = { ...defaultOptions, ...options };

    this.createStreamPlyr();

    addResizeListener(container, this.handleResizeEvent);
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this.handleResizeEvent();
  }

  private createStreamPlyr = (playback?: StreamPlayback) => {
    this.container.innerHTML = '';

    const media = document.createElement('video');

    media.setAttribute('data-qa', 'boclips-player');
    media.setAttribute('preload', 'metadata');

    if (playback) {
      media.setAttribute('src', playback.streamUrl);
      media.setAttribute('poster', playback.thumbnailUrl);
    }

    this.container.appendChild(media);

    this.resetPlyrInstance(media, playback);

    if (playback && Hls.isSupported()) {
      this.hls = new Hls({
        debug: process.env.NODE_ENV !== 'production',
        autoStartLoad: false,
      });
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls.loadSource(playback.streamUrl);
      });
      this.hls.attachMedia(this.plyr.media);
    }
  };

  private createYoutubePlyr = (playback: YoutubePlayback) => {
    this.container.innerHTML = '';

    const media = document.createElement('div');
    media.setAttribute('data-qa', 'boclips-player');
    media.setAttribute('data-plyr-provider', 'youtube');
    media.setAttribute('data-plyr-embed-id', playback.id);

    this.container.appendChild(media);

    this.resetPlyrInstance(media, playback);
  };

  private installPlyrEventListeners() {
    this.plyr.on('play', () => {
      if (!this.hasBeenDestroyed && this.hls) {
        this.hls.startLoad();
      }
    });

    this.plyr.on('enterfullscreen', () => {
      this.handleEnterFullscreen();
    });

    this.plyr.on('exitfullscreen', () => {
      this.handleExitFullscreen();
    });

    this.plyr.on('ready', () => {
      this.plyr.toggleControls(false);
    });

    this.plyr.on('playing', event => {
      this.analytics.handlePlay(event.detail.plyr.currentTime);
    });

    this.plyr.on('pause', event => {
      this.analytics.handlePause(event.detail.plyr.currentTime);
    });
  }

  public configureWithVideo = ({ playback }: Video) => {
    if (this.hasBeenDestroyed) {
      return;
    }

    if (this.hls) {
      this.hls.destroy();
    }

    if (isStreamPlayback(playback)) {
      this.createStreamPlyr(playback);
    } else {
      this.createYoutubePlyr(playback);
    }
  };

  private handleResizeEvent = () => {
    const height = this.container.clientHeight;
    const fontSize = Math.max(0.04 * height, 12);
    this.container.style.fontSize = fontSize + 'px';
  };

  private handleEnterFullscreen = () => {
    this.container.classList.add('plyr--fullscreen');
  };

  private handleExitFullscreen = () => {
    this.container.classList.remove('plyr--fullscreen');
  };

  public play = (): Promise<void> => {
    if (this.hasBeenDestroyed) {
      return;
    }

    const maybePromise = this.plyr.play();

    if (maybePromise) {
      return maybePromise.catch(error => {
        console.log('Unable to Play.', error);
      });
    }

    return new Promise(resolve => resolve());
  };

  public pause = (): void => {
    this.plyr.pause();
  };

  public destroy = () => {
    this.handleBeforeUnload();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);

    try {
      if (this.hls) {
        this.hls.destroy();
      }
    } catch (error) {
      console.warn('Error occurred while destroying hls', error);
    }

    try {
      this.plyr.destroy();
    } catch (error) {
      console.warn('Error occurred while destroying plyr', error);
    }

    this.hasBeenDestroyed = true;
  };

  private handleBeforeUnload = () => {
    if (this.plyr) {
      const currentTime = this.plyr.currentTime;
      this.analytics.handlePause(currentTime);
    }
  };

  private resetPlyrInstance = (
    media: HTMLDivElement | HTMLVideoElement,
    playback?: Playback,
  ) => {
    if (this.plyr) {
      this.plyr.destroy();
    }

    this.plyr = new Plyr(media, {
      debug: process.env.NODE_ENV !== 'production',
      captions: { active: false, language: 'en', update: true },
      controls: this.options.controls,
      duration: playback ? toSeconds(parse(playback.duration)) : null,
    });

    this.installPlyrEventListeners();
  };
}
