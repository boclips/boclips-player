import Plyr from 'plyr';
import { Wrapper } from '../Wrapper';
import './PlyrWrapper.less';

import Hls from 'hls.js';
import { addListener as addResizeListener } from 'resize-detector';
import { EventTracker } from '../../Analytics/EventTracker';
import { Video } from '../../types/Video';
import convertPlaybackToSource from './utils/convertPlaybackToSource';

export default class PlyrWrapper implements Wrapper {
  private readonly plyr;
  private hls = null;
  public static DEFAULT_CONTROLS = [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'captions',
    'fullscreen',
  ];

  // @ts-ignore
  constructor(
    private readonly container: HTMLElement,
    private readonly eventTracker: EventTracker,
  ) {
    const video = document.createElement('video');
    video.setAttribute('data-qa', 'boclips-player');

    container.appendChild(video);

    this.plyr = new Plyr(video, {
      debug: process.env.NODE_ENV !== 'production',
      captions: { active: false, language: 'en', update: true },
      controls: PlyrWrapper.DEFAULT_CONTROLS,
    });

    addResizeListener(container, this.handleResizeEvent);
    this.handleResizeEvent();

    this.installPlyrEventListeners();

    this.installEventTracker();
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
    const source = convertPlaybackToSource(video.playback);

    this.plyr.source = source;

    if (Hls.isSupported()) {
      this.hls = new Hls({
        debug: process.env.NODE_ENV !== 'production',
      });
      this.hls.attachMedia(this.plyr.media);
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls.loadSource(source.sources[0].src);
      });
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

  private installEventTracker = () => {
    this.plyr.on('playing', event => {
      this.eventTracker.handlePlay(event.detail.plyr.currentTime);
    });

    this.plyr.on('pause', event => {
      this.eventTracker.handlePause(event.detail.plyr.currentTime);
    });
  };
}
