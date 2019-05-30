import Plyr from 'plyr';
import { Wrapper } from '../Wrapper';
import './PlyrWrapper.less';

import Hls from 'hls.js';
import { addListener as addResizeListener } from 'resize-detector';
import { Analytics } from '../../Events/Analytics';
import { Video } from '../../types/Video';
import { defaultOptions, WrapperOptions } from '../WrapperOptions';
import convertPlaybackToSource from './utils/convertPlaybackToSource';

export default class PlyrWrapper implements Wrapper {
  private readonly plyr;
  private hls = null;
  private options: WrapperOptions;

  // @ts-ignore
  constructor(
    private readonly container: HTMLElement,
    private readonly analytics: Analytics,
    options: Partial<WrapperOptions> = {},
  ) {
    const video = document.createElement('video');
    video.setAttribute('data-qa', 'boclips-player');

    container.appendChild(video);

    this.options = { ...defaultOptions, ...options };

    this.plyr = new Plyr(video, {
      debug: process.env.NODE_ENV !== 'production',
      captions: { active: false, language: 'en', update: true },
      controls: this.options.controls,
    });

    addResizeListener(container, this.handleResizeEvent);
    this.handleResizeEvent();

    this.installPlyrEventListeners();

    this.installAnalytics();

    window.addEventListener('beforeunload', () => {
      const currentTime = this.plyr.currentTime;
      this.analytics.handlePause(currentTime);
    });
  }

  private installPlyrEventListeners() {
    this.plyr.on('play', () => {
      if (this.hls) {
        this.hls.startLoad();
      }
    });

    this.plyr.on('enterfullscreen', () => {
      this.handleEnterFullscreen();
    });

    this.plyr.on('exitfullscreen', () => {
      this.handleExitFullscreen();
    });
  }

  public configureWithVideo = (video: Video) => {
    if (this.hls) {
      this.hls.destroy();
    }

    const source = convertPlaybackToSource(video.playback);

    this.plyr.source = source;

    if (video.playback.type === 'STREAM') {
      if (Hls.isSupported()) {
        this.hls = new Hls({
          debug: process.env.NODE_ENV !== 'production',
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
    return this.plyr.play();
  };

  public pause = (): void => {
    this.plyr.pause();
  };

  public destroy = () => {
    if (this.hls) {
      this.hls.destroy();
    }

    this.plyr.destroy();
  };

  private installAnalytics = () => {
    this.plyr.on('playing', event => {
      this.analytics.handlePlay(event.detail.plyr.currentTime);
    });

    this.plyr.on('pause', event => {
      this.analytics.handlePause(event.detail.plyr.currentTime);
    });
  };
}
