import Plyr from 'plyr';
import { PrivatePlayer } from '../../BoclipsPlayer/BoclipsPlayer';
import { StreamingTechnique } from '../../StreamingTechnique/StreamingTechnique';
import { StreamingTechniqueFactory } from '../../StreamingTechnique/StreamingTechniqueFactory';
import {
  isStreamPlayback,
  isYoutubePlayback,
  Playback,
} from '../../types/Playback';
import { EnrichedPlyr } from '../../types/plyr';
import { Video } from '../../types/Video';
import { MediaPlayer, PlaybackSegment } from '../MediaPlayer';
import { Addon, AddonInterface, Addons } from './Addons/Addons';
import { EndOverlay } from './Addons/SharedFeatures/SharedFeatures';
import './PlyrWrapper.less';
import { Logger } from '../../Logger';
import { NullLogger } from '../../NullLogger';

export default class PlyrWrapper implements MediaPlayer {
  private plyr: EnrichedPlyr;
  private streamingTechnique: StreamingTechnique = null;
  private hasBeenDestroyed: boolean = false;
  private enabledAddons: AddonInterface[] = [];
  private playback: Playback = null;
  private onEndCallback?: (endOverlay: HTMLDivElement) => void = null;
  private segment: PlaybackSegment = null;

  constructor(
    private readonly player: PrivatePlayer,
    private readonly logger: Logger = new NullLogger(),
  ) {
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
          thumbnailHeight: this.player.getContainer().clientHeight,
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

    this.plyr.on('play', (event) => {
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
    this.plyr.on('enterfullscreen', (event) => {
      this.handleEnterFullscreen();

      this.player
        .getAnalytics()
        .handleInteraction(
          event.detail.plyr.currentTime,
          'fullscreenEnabled',
          {},
        );
    });

    this.plyr.on('exitfullscreen', (event) => {
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

    this.plyr.on('playing', (event) => {
      this.player.getAnalytics().handlePlay(event.detail.plyr.currentTime);
    });

    this.plyr.on('progress', () => {
      EndOverlay.destroyIfExists(this.getPlyrDivContainer());
    });

    this.plyr.on('pause', (event) => {
      this.player.getAnalytics().handlePause(event.detail.plyr.currentTime);
    });

    this.plyr.on('play', () => {
      EndOverlay.destroyIfExists(this.getPlyrDivContainer());
    });

    this.plyr.on('ratechange', (event) => {
      const plyr = event.detail.plyr;

      this.player
        .getAnalytics()
        .handleInteraction(plyr.currentTime, 'speedChanged', {
          speed: plyr.speed,
        });
    });

    this.plyr.on('error', (event) => {
      const eventDetailsPlyr = event.detail.plyr as EnrichedPlyr;
      const mediaError = eventDetailsPlyr.media.error;

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

    // /**
    //  * Current Plyr and HLS versions have a bug when the video has multiple captions. This seems to stem from a
    //  * timing issue loading the TextTrack content. It seems to not initialise the first TextTrack properly, and
    //  * leaves the mode 'disabled'.
    //  * As the Plyr is unable to show the first caption, we force the mode whenever the video starts playing, or the
    //  * captions are enabled, if captions are active.
    //  *
    //  * @see https://github.com/sampotts/plyr/issues/994 et al.
    //  */
    //
    const playerContainer = this.player.getContainer();
    //
    const forceShowCaption = () => {
      setTimeout(() => {
        if (
          this.plyr &&
          this.plyr.captions &&
          this.plyr.captions.active &&
          this.plyr.captions.currentTrackNode
        ) {
          const trackNode = this.plyr.captions.currentTrackNode;
          if (!trackNode || !trackNode.activeCues) return;
          trackNode.mode = 'showing';
        }
        if (
          this.plyr &&
          this.plyr.captions &&
          this.plyr.captions.currentTrackNode &&
          this.plyr.captions.currentTrackNode.label.includes(
            'auto-generated',
          ) &&
          !this.getDisplayAutogeneratedCaptions()
        ) {
          playerContainer.classList.add('disable-cc');
          this.plyr.captions.currentTrackNode.mode = 'disabled';
        }
      }, 500);
    };

    this.plyr.on('languagechange', forceShowCaption);
    this.plyr.on('languagechange', (e) => {
      if (this.streamingTechnique) {
        this.streamingTechnique.changeCaptions(e.detail.plyr.currentTrack);
      }
    });

    if (this.onEndCallback) {
      this.plyr.on('ended', () => {
        const endOverlay = EndOverlay.createIfNotExists(
          this.getPlyrDivContainer(),
        );

        this.onEndCallback(endOverlay);
      });
    }
  }

  public configureWithVideo = (
    { playback, title, description, id }: Video,
    segment?: PlaybackSegment,
  ) => {
    if (this.hasBeenDestroyed) {
      return;
    }

    if (this.streamingTechnique) {
      this.streamingTechnique.destroy();
    }
    this.playback = playback;
    this.segment = segment || undefined;

    if (isStreamPlayback(this.playback)) {
      this.createStreamPlyr(this.segment && this.segment.start);
    } else {
      this.createYoutubePlyr(this.segment && this.segment.start);
      this.plyr.on('playing', () => {
        /**
         * This is a workaround to show official youtube controls.
         * The trick works by visually removing a CSS overlay which
         * prevents events from being propagated.
         *
         * We found that this needs to happen at runtime, and cannot
         * be achieved by setting CSS ahead of time. When doing so,
         * the playback stops.
         *
         * With the current test setup it is not possible to access
         * the underlying container. Therefore this behaviour cannot be tested.
         *
         * These may be good reasons to consider replacing plyr with vime-js,
         * and apply a test first approach.
         */
        const poster = this.player
          .getContainer()
          .querySelector('.plyr__poster') as HTMLDivElement;

        if (poster) {
          poster.style.display = 'none';
        }
      });
    }

    if (this.segment) {
      this.updateAddonSegments(segment);
      const segmentStart = this.segment.start || 0;

      if (segmentStart) {
        const skipToStart = (event) => {
          event.detail.plyr.currentTime = segmentStart;
          event.detail.plyr.off('playing', skipToStart);
        };

        this.plyr.on('playing', skipToStart);
        // Some browsers won't let you set the currentTime before the metadata
        // has loaded, but it gives a slightly better experience on Chrome
        this.plyr.currentTime = segmentStart;
      }

      if (this.segment.end && this.segment.end > segmentStart) {
        this.plyr.on('seeking', this.autoStop);
        this.plyr.on('timeupdate', this.autoStop);
      }
    }

    if (title && description) {
      const container = this.plyr.elements.container;
      if (container instanceof Element) {
        const titleElement = document.createElement('div');
        const descriptionElement = document.createElement('div');
        const titleId = id + '-title';
        const descriptionId = id + '-description';

        titleElement.setAttribute('id', titleId);
        titleElement.classList.add('not-visible-sr');
        titleElement.innerHTML = `${title}. Video. `;

        descriptionElement.setAttribute('id', descriptionId);
        descriptionElement.classList.add('not-visible-sr');
        descriptionElement.innerHTML = description;

        container.appendChild(titleElement);
        container.appendChild(descriptionElement);

        container.setAttribute('aria-labelledby', titleId);
        container.setAttribute('aria-describedby', descriptionId);
      }
    }
  };

  private autoStop = (event) => {
    const plyr = event.detail.plyr;

    if (plyr.currentTime > this.segment.end) {
      plyr.pause();
      this.stopStreamingTechnique();
      plyr.currentTime = this.segment.end;
    }
    if (plyr.currentTime < this.segment.start) {
      plyr.pause();
      this.stopStreamingTechnique();
      plyr.currentTime = this.segment.start;
    }
  };

  private stopStreamingTechnique = () => {
    if (this.streamingTechnique) {
      this.streamingTechnique.stopLoad();
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
    const logger = this.logger;

    if (maybePromise) {
      return maybePromise.catch((error) => {
        logger.error('Unable to Play.', error, JSON.stringify(error));
      });
    }

    return new Promise((resolve) => resolve());
  };

  public pause = (): void => {
    this.plyr.pause();
  };

  public onEnd = (callback: (endOverlay: HTMLDivElement) => void): void => {
    this.onEndCallback = callback;
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
      this.logger.warn(
        'Error occurred while destroying the streaming technique',
        error,
      );
    }

    try {
      this.plyr.destroy();
    } catch (error) {
      this.logger.warn('Error occurred while destroying plyr', error);
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
      captions: { active: false, update: true },
      /**
       * This is necessary workaround to allow official youtube controls.
       */
      controls: isYoutubePlayback(this.playback)
        ? ['play-large']
        : this.getOptions().controls,
      // @ts-ignore
      youtube: isYoutubePlayback(this.playback) ? { controls: 1 } : undefined,
      duration: this.playback ? this.playback.duration : null,
      tooltips: { controls: true, seek: true },
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
      ratio: this.getOptions().ratio,
    }) as EnrichedPlyr;

    this.installPlyrEventListeners();
    this.installAddons();
  };

  private installAddons = () => {
    Addons.forEach((addonToInstall: Addon) => {
      if (
        addonToInstall.canBeEnabled(this.plyr, this.playback, this.getOptions())
      ) {
        // tslint:disable-next-line: no-unused-expression
        this.enabledAddons.push(
          new addonToInstall(this.plyr, this.playback, this.getOptions()),
        );
      }
    });
  };

  private destroyAddons = () => {
    this.enabledAddons.forEach((addon) => addon.destroy());
    this.enabledAddons = [];
  };

  private updateAddonSegments = (segment) => {
    this.enabledAddons.forEach((addon) => {
      addon.updateSegment(segment);
    });
  };

  private getOptions = () => this.player.getOptions().interface;

  public getSegment = () => this.segment;

  private getDisplayAutogeneratedCaptions = () =>
    this.player.getOptions().displayAutogeneratedCaptions;

  public getVideoContainer = () => this.plyr.media;

  public getCurrentTime = () => this.plyr.currentTime;

  public getEnabledAddons = () => this.enabledAddons;

  private getPlyrDivContainer(): HTMLElement {
    return this.player.getContainer().querySelector('.plyr');
  }
}
