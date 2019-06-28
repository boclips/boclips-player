import Hls from 'hls.js';
import Plyr from 'plyr';
import { PrivatePlayer } from '../../BoclipsPlayer/BoclipsPlayer';
import {
  isStreamPlayback,
  Playback,
  StreamPlayback,
  YoutubePlayback,
} from '../../types/Playback';
import { Video } from '../../types/Video';
import { Wrapper } from '../Wrapper';
import './PlyrWrapper.less';

export default class PlyrWrapper implements Wrapper {
  private plyr;
  private hls = null;
  private hasBeenDestroyed: boolean = false;

  constructor(private readonly player: PrivatePlayer) {
    this.createStreamPlyr();

    window.addEventListener('beforeunload', this.handleBeforeUnload);

    if (
      this.getOptions().controls.indexOf('mute') !== -1 &&
      this.getOptions().controls.indexOf('volume') === -1
    ) {
      this.player.getContainer().classList.add('plyr--only-mute');
    }
  }

  private createStreamPlyr = (playback?: StreamPlayback) => {
    this.player.getContainer().innerHTML = '';

    const media = document.createElement('video');

    media.setAttribute('data-qa', 'boclips-player');
    media.setAttribute('preload', 'metadata');

    if (playback) {
      media.setAttribute('src', playback.streamUrl);
      media.setAttribute('poster', playback.thumbnailUrl);
    }

    this.player.getContainer().appendChild(media);

    this.resetPlyrInstance(media, playback);

    if (playback && Hls.isSupported()) {
      this.hls = new Hls({
        debug: process.env.NODE_ENV !== 'production',
        autoStartLoad: false,
      });
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls.loadSource(playback.streamUrl);
      });
      this.hls.on(Hls.Events.ERROR, (_, data) => {
        this.player.getErrorHandler().handleError({
          fatal: data.fatal,
          type: data.type,
          payload: data,
        });
      });
      this.hls.attachMedia(this.plyr.media);
    }
  };

  private createYoutubePlyr = (playback: YoutubePlayback) => {
    this.player.getContainer().innerHTML = '';

    const media = document.createElement('div');
    media.setAttribute('data-qa', 'boclips-player');
    media.setAttribute('data-plyr-provider', 'youtube');
    media.setAttribute('data-plyr-embed-id', playback.id);

    this.player.getContainer().appendChild(media);

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
      this.player.getAnalytics().handlePlay(event.detail.plyr.currentTime);
    });

    this.plyr.on('pause', event => {
      this.player.getAnalytics().handlePause(event.detail.plyr.currentTime);
    });

    this.plyr.on('error', event => {
      const mediaError = event.detail.plyr.media.error;

      if (mediaError.code && mediaError.message) {
        this.player.getErrorHandler().handleError({
          fatal: true,
          type: 'PLAYBACK_ERROR',
          payload: {
            code: mediaError.code,
            message: mediaError.message,
          },
        });
      }
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

  private handleEnterFullscreen = () => {
    this.player.getContainer().classList.add('plyr--fullscreen');
  };

  private handleExitFullscreen = () => {
    this.player.getContainer().classList.remove('plyr--fullscreen');
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
      this.player.getAnalytics().handlePause(currentTime);
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
      controls: this.getOptions().controls,
      duration: playback ? playback.duration : null,
    });

    this.installPlyrEventListeners();
  };

  private getOptions = () => this.player.getOptions().interface;
}
