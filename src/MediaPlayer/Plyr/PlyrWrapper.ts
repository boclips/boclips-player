import Plyr, { MarkersPoints } from 'plyr';
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
import { Logger } from '../../Logger';
import { NullLogger } from '../../NullLogger';
import './sass/plyr.scss';
import { OnReadyResult } from '../../types/OnReadyResult';

export default class PlyrWrapper implements MediaPlayer {
  private plyr: EnrichedPlyr;
  private streamingTechnique: StreamingTechnique = null;
  private hasBeenDestroyed: boolean = false;
  private enabledAddons: AddonInterface[] = [];
  private playback: Playback = null;
  private onEndCallback?: (endOverlay: HTMLDivElement) => void = null;
  private onReadyCallback?: (result: OnReadyResult) => void = null;
  private segment: PlaybackSegment = null;
  private hasPlaybackStarted: boolean = false;

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

  private createStreamPlyr = (segmentStart?: number, segmentEnd?: number) => {
    this.player.getContainer().innerHTML = '';

    const media = document.createElement('video');

    media.setAttribute('data-qa', 'boclips-player');
    media.setAttribute('preload', 'metadata');

    if (isStreamPlayback(this.playback)) {
      media.setAttribute(
        'src',
        this.playback.links.hlsStream.getOriginalLink(),
      );

      if (this.playback.links.thumbnail) {
        media.setAttribute(
          'poster',
          this.playback.links.thumbnail.getTemplatedLink({
            thumbnailWidth: this.player.getContainer().clientWidth,
            thumbnailHeight: this.player.getContainer().clientHeight,
          }),
        );
      }
    }

    this.player.getContainer().appendChild(media);

    this.resetPlyrInstance(media, segmentStart, segmentEnd);

    const playerChildrenNodes =
      this.player.getContainer().firstChild.childNodes;

    const playButton = this.player
      .getContainer()
      .querySelector('.plyr__control.plyr__control--overlaid');

    const playButtonIndex = Array.from(playerChildrenNodes).indexOf(playButton);

    playerChildrenNodes[playButtonIndex]?.parentNode?.insertBefore(
      playerChildrenNodes[playButtonIndex],
      playerChildrenNodes[0],
    );

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

    if (this.plyr.elements?.poster?.style) {
      this.plyr.elements.poster.style.display = 'none';
    }
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

    /**
     * This is a hack to get playback events for youtube videos as we're using official youtube player under the hood.
     * https://github.com/sampotts/plyr/issues/2378
     */
    this.plyr.on('statechange', () => {
      if (!this.plyr.ready) {
        this.plyr.ready = true;
        this.plyr.listeners.media();
      }
    });

    this.plyr.on('playing', (event) => {
      this.player.getAnalytics().handlePlay(event.detail.plyr.currentTime);
    });

    this.plyr.on('progress', () => {
      EndOverlay.destroyIfExists(this.getPlyrDivContainer());
    });

    this.plyr.on('pause', (event) => {
      this.player
        .getAnalytics()
        .handleInteraction(event.detail.plyr.currentTime, 'pause', {});

      this.player.getAnalytics().handlePause(event.detail.plyr.currentTime);
    });

    this.plyr.on('seeked', (event) => {
      this.player
        .getAnalytics()
        .handleInteraction(event.detail.plyr.currentTime, 'seeked', {});
    });

    this.plyr.on('timeupdate', (event) => {
      this.player
        .getAnalytics()
        .handleTimeUpdate(event.detail.plyr.currentTime);
    });

    this.plyr.on('captionsenabled', (event) => {
      this.player
        .getAnalytics()
        .handleInteraction(event.detail.plyr.currentTime, 'captionsEnabled', {
          kind: this.plyr.captions.currentTrackNode.kind,
          label: this.plyr.captions.currentTrackNode.label,
          language: this.plyr.captions.currentTrackNode.language,
        });
    });

    this.plyr.on('captionsdisabled', (event) => {
      this.player
        .getAnalytics()
        .handleInteraction(
          event.detail.plyr.currentTime,
          'captionsDisabled',
          {},
        );
    });

    this.plyr.on('languagechange', (event) => {
      this.player
        .getAnalytics()
        .handleInteraction(
          event.detail.plyr.currentTime,
          'captionsLanguageChanged',
          {
            kind: this.plyr.captions.currentTrackNode.kind,
            label: this.plyr.captions.currentTrackNode.label,
            language: this.plyr.captions.currentTrackNode.language,
          },
        );
    });

    this.plyr.on('play', (event) => {
      if (!this.hasPlaybackStarted) {
        this.hasPlaybackStarted = true;
        this.player
          .getAnalytics()
          .handleInteraction(
            event.detail.plyr.currentTime,
            'playbackStarted',
            {},
          );
      } else {
        this.player
          .getAnalytics()
          .handleInteraction(event.detail.plyr.currentTime, 'play', {});
      }

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
          playerId: this.player.getPlayerId(),
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

        this.disableAutoGeneratedCaptions(playerContainer);
      }, 500);
    };

    this.plyr.on('languagechange', forceShowCaption);

    this.plyr.on('play', () => {
      setTimeout(() => {
        this.disableAutoGeneratedCaptions(playerContainer);
      }, 500);
    });

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

  private disableAutoGeneratedCaptions(playerContainer: HTMLElement) {
    if (
      this.plyr &&
      this.plyr.captions &&
      this.plyr.captions.currentTrackNode &&
      this.plyr.captions.currentTrackNode.label.includes('auto-generated') &&
      !this.getDisplayAutogeneratedCaptions()
    ) {
      playerContainer.classList.add('disable-cc');
      this.plyr.captions.currentTrackNode.mode = 'disabled';
      this.plyr.toggleCaptions(false);
      this.plyr.captions.active = false;
    }
  }

  public configureWithVideo = (video: Video, segment?: PlaybackSegment) => {
    const { title, description, playback } = video;
    if (this.hasBeenDestroyed) {
      return;
    }

    if (this.streamingTechnique) {
      this.streamingTechnique.destroy();
    }
    this.playback = playback;
    this.segment = segment || undefined;

    if (isStreamPlayback(this.playback)) {
      this.createStreamPlyr(
        this.segment && this.segment.start,
        this.segment && this.segment.end,
      );
    } else {
      this.createYoutubePlyr(this.segment && this.segment.start);
    }

    this.addSliderBackground();

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

      const playerContainerEl = this.player.getContainer();
      const playerTimerEl = playerContainerEl
        .querySelector('.plyr__progress')
        ?.querySelector('input[type="range"]');

      if (playerTimerEl == null) {
        return;
      }

      this.addTimelineBackgroundBeforeStartMark(playerTimerEl);
      this.addTimelineBackgroundAfterEndMark(playerTimerEl);
      this.handleStartMarkerSliderThumb(playerTimerEl);
      this.handlePlayerTimerWithStartSegment(playerContainerEl);
    }

    if (title && description) {
      const container = this.plyr.elements.container;
      if (container instanceof Element) {
        const titleElement = document.createElement('div');
        const descriptionElement = document.createElement('div');

        titleElement.classList.add('plyr__sr-only');
        titleElement.innerHTML = `${title}. Video. `;

        descriptionElement.classList.add('plyr__sr-only');
        descriptionElement.innerHTML = description;

        container.appendChild(titleElement);
        container.appendChild(descriptionElement);
      }
    }
    if (this.onReadyCallback && typeof this.onReadyCallback === 'function')
      this.onReadyCallback({
        plyr: this.plyr,
        video,
      });
  };

  private addSliderBackground = () => {
    const rangeBackgroundDiv = document.createElement('div');
    rangeBackgroundDiv.classList.add('rangeBackground');
    this.player
      .getContainer()
      .querySelector('[data-plyr="seek"]')
      ?.parentElement.appendChild(rangeBackgroundDiv);
  };

  private handlePlayerTimerWithStartSegment = (playerContainerEl: Element) => {
    const minutes = Math.floor(this.segment.start / 60);
    const remainingSeconds = this.segment.start % 60;
    const formattedTime = `${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    playerContainerEl.querySelector('div[role="timer"]').textContent =
      formattedTime;
  };

  private handleStartMarkerSliderThumb = (playerTimerEl: Element) => {
    const seekStart = (this.segment.start / this.plyr.duration) * 100;
    playerTimerEl.setAttribute('value', seekStart.toString());
  };

  private addTimelineBackgroundBeforeStartMark = (playerTimerEl: Element) => {
    const seekStart = (this.segment.start / this.plyr.duration) * 100;

    const timelineAfterEndMarkEl = document.createElement('div');
    timelineAfterEndMarkEl.classList.add('startIndicator');
    timelineAfterEndMarkEl.style.width = seekStart + '%';
    playerTimerEl.parentElement.appendChild(timelineAfterEndMarkEl);
  };

  private addTimelineBackgroundAfterEndMark = (playerTimerEl: Element) => {
    const seekEnd = (this.segment.end / this.plyr.duration) * 100;

    const timelineBeforeStartMarkEl = document.createElement('div');
    timelineBeforeStartMarkEl.classList.add('endIndicator');
    timelineBeforeStartMarkEl.style.width = 100 - seekEnd + '%';
    playerTimerEl.parentElement.appendChild(timelineBeforeStartMarkEl);
  };

  private addRemoveMarksButton = () => {
    const id = 'unblock-markers';

    if (!this.player.getContainer().querySelector('#' + id)) {
      const button = document.createElement('button');
      button.innerText = 'Watch complete video';
      button.id = id;
      button.classList.add('reloadVideo');
      button.onclick = () => {
        this.segment = {};
        document.querySelector('#' + id).remove();
        this.plyr.play();
      };
      this.player
        .getContainer()
        ?.querySelector('.plyr__controls')
        ?.append(button);
    }
  };

  private autoStop = (event) => {
    const plyr = event.detail.plyr;

    if (plyr.currentTime > this.segment.end) {
      plyr.pause();
      this.stopStreamingTechnique();
      plyr.currentTime = this.segment.end;
      this.addRemoveMarksButton();
    }
    if (plyr.currentTime < this.segment.start) {
      plyr.pause();
      this.stopStreamingTechnique();
      plyr.currentTime = this.segment.start;
      this.addRemoveMarksButton();
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

  public onReady = (callback: (result: OnReadyResult) => void) => {
    this.onReadyCallback = callback;
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

  private resetPlyrInstance = (
    media: HTMLDivElement | HTMLVideoElement,
    segmentStart?: number,
    segmentEnd?: number,
  ) => {
    if (this.plyr) {
      this.plyr.destroy();
    }

    const markers: MarkersPoints[] = [];

    if (segmentStart) {
      markers.push({
        time: segmentStart,
        label: 'start',
      });
    }

    if (segmentEnd) {
      markers.push({
        time: segmentEnd,
        label: 'end',
      });
    }

    this.plyr = new Plyr(media, {
      debug: this.player.getOptions().debug,
      captions: { active: false, update: true },
      speed: {
        selected: 1,
        options: [0.5, 1, 1.5, 2],
      },
      markers: {
        enabled: markers.length > 0,
        points: markers,
      },
      controls: this.getOptions().controls,
      // Don't use any plyr controls for youtube playback https://github.com/sampotts/plyr/issues/1738#issuecomment-943760053
      youtube: { customControls: false },
      displayDuration: true,
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
        addonToInstall.isEnabled(this.plyr, this.playback, this.getOptions())
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
