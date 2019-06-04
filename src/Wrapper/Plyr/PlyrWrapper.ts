import { parse, toSeconds } from 'iso8601-duration';
import Plyr from 'plyr';
import { Wrapper } from '../Wrapper';
import './PlyrWrapper.less';

import Hls from 'hls.js';
import { addListener as addResizeListener } from 'resize-detector';
import { Analytics } from '../../Events/Analytics';
import { Playback } from '../../types/Playback';
import { Video } from '../../types/Video';
import { defaultOptions, WrapperOptions } from '../WrapperOptions';
import { Source } from './types';
import convertPlaybackToSource from './utils/convertPlaybackToSource';

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

  private createStreamPlyr = (playback?: Playback, source?: Source) => {
    this.container.innerHTML = '';

    const video = document.createElement('video');
    video.setAttribute('data-qa', 'boclips-player');
    video.setAttribute('preload', 'metadata');

    if (source) {
      source.sources.forEach(sourceEntry => {
        const sourceElement = document.createElement('source');
        Object.keys(sourceEntry).forEach(key =>
          sourceElement.setAttribute(key, sourceEntry[key]),
        );
        video.appendChild(sourceElement);
      });

      if (source.poster) {
        video.setAttribute('poster', source.poster);
      }
    }

    this.container.appendChild(video);

    if (this.plyr) {
      this.plyr.destroy();
    }

    this.plyr = new Plyr(video, {
      debug: process.env.NODE_ENV !== 'production',
      captions: { active: false, language: 'en', update: true },
      controls: this.options.controls,
      duration: playback ? toSeconds(parse(playback.duration)) : null,
    });

    this.installPlyrEventListeners();
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

  public configureWithVideo = (video: Video) => {
    if (this.hasBeenDestroyed) {
      return;
    }

    if (this.hls) {
      this.hls.destroy();
    }

    const source = convertPlaybackToSource(video.playback);

    if (video.playback.type === 'STREAM') {
      this.createStreamPlyr(video.playback, source);

      if (Hls.isSupported()) {
        this.hls = new Hls({
          debug: process.env.NODE_ENV !== 'production',
          autoStartLoad: false,
        });
        this.hls.attachMedia(this.plyr.media);
        this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          this.hls.loadSource(source.sources[0].src);
        });
      } else {
        this.plyr.media.addEventListener('loadedmetadata', () => {
          // noinspection JSIgnoredPromiseFromCall
          this.play();
        });
      }
    } else {
      this.plyr.source = source;
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

    if (this.hls) {
      this.hls.destroy();
    }

    this.plyr.destroy();

    this.hasBeenDestroyed = true;
  };

  private handleBeforeUnload = () => {
    if (this.plyr) {
      const currentTime = this.plyr.currentTime;
      this.analytics.handlePause(currentTime);
    }
  };
}
