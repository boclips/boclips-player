import Plyr from 'plyr';
import { PrivatePlayer } from '../../BoclipsPlayer/BoclipsPlayer';
import { StreamingTechnique } from '../../StreamingTechnique/StreamingTechnique';
import { StreamingTechniqueFactory } from '../../StreamingTechnique/StreamingTechniqueFactory';
import {
  isStreamPlayback,
  isYoutubePlayback,
  Playback,
} from '../../types/Playback';
import { Video } from '../../types/Video';
import { MediaPlayer, PlaybackSegment } from '../MediaPlayer';
import { Addon, AddonInterface, Addons } from './Addons/Addons';
import './PlyrWrapper.less';

export default class PlyrWrapper implements MediaPlayer {
  private plyr: Plyr.Plyr;
  private streamingTechnique: StreamingTechnique = null;
  private hasBeenDestroyed: boolean = false;
  private enabledAddons: AddonInterface[] = [];
  private playback: Playback = null;

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

  private createStreamPlyr = (segmentStart?: number) => {
    this.player.getContainer().innerHTML = '';

    const media = document.createElement('video');

    media.setAttribute('data-qa', 'boclips-player');
    media.setAttribute('preload', 'metadata');

    if (isStreamPlayback(this.playback)) {
      media.setAttribute(
        'src',
        this.playback.links.hlsStream.getOriginalLink(),
      );
      media.setAttribute(
        'poster',
        this.playback.links.thumbnail.getTemplatedLink({
          thumbnailWidth: this.player.getContainer().clientWidth,
        }),
      );
    }

    this.player.getContainer().appendChild(media);

    this.resetPlyrInstance(media);

    if (isStreamPlayback(this.playback)) {
      this.initialiseStreamingTechnique(segmentStart);
    }
  };

  private initialiseStreamingTechnique = (segmentStart?: number) => {
    this.streamingTechnique = StreamingTechniqueFactory.get(this.player);

    if (!this.streamingTechnique || !isStreamPlayback(this.playback)) {
      return;
    }

    this.streamingTechnique.initialise(this.playback, segmentStart);

    this.plyr.on('play', event => {
      const plyr = event.detail.plyr;

      this.streamingTechnique.startLoad(plyr.currentTime);
    });
  };

  private createYoutubePlyr = (segmentStart?: number) => {
    if (!isYoutubePlayback(this.playback)) {
      throw new Error('Unable to create YouTube Plyr for non-YouTube playback');
    }

    this.player.getContainer().innerHTML = '';

    const media = document.createElement('div');
    media.setAttribute('data-qa', 'boclips-player');
    media.setAttribute('data-plyr-provider', 'youtube');
    media.setAttribute('data-plyr-embed-id', this.playback.id);
    if (segmentStart) {
      media.setAttribute(
        'data-plyr-config',
        JSON.stringify({
          youtube: {
            start: segmentStart,
          },
        }),
      );
    }

    this.player.getContainer().appendChild(media);

    this.resetPlyrInstance(media);
  };

  private installPlyrEventListeners() {
    this.plyr.on('enterfullscreen', event => {
      this.handleEnterFullscreen();

      this.player
        .getAnalytics()
        .handleInteraction(
          event.detail.plyr.currentTime,
          'fullscreenEnabled',
          {},
        );
    });

    this.plyr.on('exitfullscreen', event => {
      this.handleExitFullscreen();

      this.player
        .getAnalytics()
        .handleInteraction(
          event.detail.plyr.currentTime,
          'fullscreenDisabled',
          {},
        );
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

    /**
     * These events occur automatically without user intervention when the streams
     * are loaded. It's currently not possible to determine whether a user caused
     * this to happen
     *
     * @see https://github.com/sampotts/plyr/issues/1491
     */
    // this.plyr.on('captionsenabled', event => {
    //   const plyr = event.detail.plyr;
    //
    //   this.player
    //     .getAnalytics()
    //     .handleInteraction(plyr.currentTime, 'captionsEnabled', {
    //       id: plyr.captions.currentTrackNode.id,
    //       kind: plyr.captions.currentTrackNode.kind,
    //       label: plyr.captions.currentTrackNode.label,
    //       language: plyr.captions.currentTrackNode.language,
    //     });
    // });
    //
    // this.plyr.on('languagechange', event => {
    //   const plyr = event.detail.plyr;
    //
    //   this.player
    //     .getAnalytics()
    //     .handleInteraction(plyr.currentTime, 'captionsChanged', {
    //       id: plyr.captions.currentTrackNode.id,
    //       kind: plyr.captions.currentTrackNode.kind,
    //       label: plyr.captions.currentTrackNode.label,
    //       language: plyr.captions.currentTrackNode.language,
    //     });
    // });
    //
    // this.plyr.on('captionsdisabled', event => {
    //   this.player
    //     .getAnalytics()
    //     .handleInteraction(
    //       event.detail.plyr.currentTime,
    //       'captionsDisabled',
    //       {},
    //     );
    // });

    this.plyr.on('ratechange', event => {
      const plyr = event.detail.plyr;

      this.player
        .getAnalytics()
        .handleInteraction(plyr.currentTime, 'speedChanged', {
          speed: plyr.speed,
        });
    });

    this.plyr.on('error', event => {
      const mediaError = event.detail.plyr.media.error;

      if (mediaError && mediaError.code && mediaError.message) {
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

  public configureWithVideo = (
    { playback }: Video,
    segment?: PlaybackSegment,
  ) => {
    if (this.hasBeenDestroyed) {
      return;
    }

    if (this.streamingTechnique) {
      this.streamingTechnique.destroy();
    }

    this.playback = playback;

    if (isStreamPlayback(this.playback)) {
      this.createStreamPlyr(segment && segment.start);
    } else {
      this.createYoutubePlyr(segment && segment.start);
    }

    if (segment) {
      const segmentStart = segment.start || 0;

      if (segmentStart) {
        const skipToStart = event => {
          console.log('skipping to start', segmentStart);
          event.detail.plyr.currentTime = segmentStart;
          event.detail.plyr.off('playing', skipToStart);
        };

        this.plyr.on('playing', skipToStart);
        // Some browsers won't let you set the currentTime before the metadata
        // has loaded, but it gives a slightly better experience on Chrome
        this.plyr.currentTime = segmentStart;
      }

      if (segment.end && segment.end > segmentStart) {
        const autoStop = event => {
          const plyr = event.detail.plyr;

          if (plyr.currentTime >= segment.end) {
            plyr.pause();

            if (this.streamingTechnique) {
              this.streamingTechnique.stopLoad();
            }

            plyr.off('timeupdate', autoStop);
          }
        };
        this.plyr.on('timeupdate', autoStop);
      }
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
        console.error('Unable to Play.', error, JSON.stringify(error));
      });
    }

    return new Promise(resolve => resolve());
  };

  public pause = (): void => {
    this.plyr.pause();
  };

  public destroy = () => {
    if (this.hasBeenDestroyed) {
      return;
    }

    this.destroyAddons();

    this.handleBeforeUnload();

    this.hasBeenDestroyed = true;

    window.removeEventListener('beforeunload', this.handleBeforeUnload);

    try {
      if (this.streamingTechnique) {
        this.streamingTechnique.destroy();
      }
    } catch (error) {
      console.warn('Error occurred while destroying hls', error);
    }

    try {
      this.plyr.destroy();
    } catch (error) {
      console.warn('Error occurred while destroying plyr', error);
    }
  };

  private handleBeforeUnload = () => {
    if (!this.hasBeenDestroyed && this.plyr) {
      const currentTime = this.plyr.currentTime;
      this.player.getAnalytics().handlePause(currentTime);
    }
  };

  private resetPlyrInstance = (media: HTMLDivElement | HTMLVideoElement) => {
    if (this.plyr) {
      this.plyr.destroy();
    }

    this.plyr = new Plyr(media, {
      debug: this.player.getOptions().debug,
      captions: { active: false, language: 'en', update: true },
      controls: this.getOptions().controls,
      duration: this.playback ? this.playback.duration : null,
      listeners: {
        fastForward: () => {
          this.player
            .getAnalytics()
            .handleInteraction(this.plyr.currentTime, 'jumpedForward', {});
          return true;
        },
        rewind: () => {
          this.player
            .getAnalytics()
            .handleInteraction(this.plyr.currentTime, 'jumpedBackward', {});
          return true;
        },
        mute: () => {
          this.player
            .getAnalytics()
            .handleInteraction(
              this.plyr.currentTime,
              this.plyr.muted ? 'unmuted' : 'muted',
              {},
            );
          return true;
        },
      },
    });

    this.installPlyrEventListeners();
    this.installAddons();
  };

  private installAddons = () => {
    Addons.forEach((AddonToInstall: Addon) => {
      if (
        AddonToInstall.canBeEnabled(this.plyr, this.playback, this.getOptions())
      ) {
        // tslint:disable-next-line: no-unused-expression
        this.enabledAddons.push(
          new AddonToInstall(this.plyr, this.playback, this.getOptions()),
        );
      }
    });
  };

  private destroyAddons = () => {
    this.enabledAddons.forEach(addon => addon.destroy());
    this.enabledAddons = [];
  };

  private getOptions = () => this.player.getOptions().interface;

  public getVideoContainer = () => this.plyr.media;

  public getCurrentTime = () => this.plyr.currentTime;

  public getEnabledAddons = () => this.enabledAddons;
}
