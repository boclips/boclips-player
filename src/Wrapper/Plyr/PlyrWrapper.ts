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
import { PlaybackSegment, Wrapper } from '../Wrapper';
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

  private createStreamPlyr = (
    playback?: StreamPlayback,
    segmentStart: number = -1,
  ) => {
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

    if (!playback) {
      return;
    }

    if (Hls.isSupported()) {
      this.hls = new Hls({
        debug: this.player.getOptions().debug,
        autoStartLoad: false,
        startPosition: segmentStart,
      });

      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls.loadSource(playback.streamUrl);
      });

      this.hls.on(Hls.Events.ERROR, (_, data) => {
        let fatal = data.fatal;

        if (
          data.type === Hls.ErrorTypes.MEDIA_ERROR &&
          data.details === 'fragParsingError'
        ) {
          // A fragParsingError is usually recoverable, even if fatal is true.
          fatal = false;
        }

        if (!fatal) {
          console.warn('A non-fatal playback error occurred', data);
        }

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.warn(
              'fatal network error encountered, try to recover',
              data,
            );
            this.hls.startLoad(this.plyr.currentTime);
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.warn('fatal media error encountered', data);
            break;
          default:
            // cannot recover
            this.destroy();

            this.player.getErrorHandler().handleError({
              fatal: data.fatal,
              type: data.type,
              payload: data,
            });
            break;
        }

        const video = this.player.getVideo();

        throw new Error(
          `A fatal playback error occurred: VideoId: ${
            video ? video.id : '-'
          }. Type: ${data.type}. Details: ${data.details}. Reason: ${
            data.reason
          }. Error: ${data.err}`,
        );
      });

      this.hls.attachMedia(this.plyr.media);

      this.plyr.on('play', event => {
        const plyr = event.detail.plyr;

        if (!this.hasBeenDestroyed && this.hls) {
          this.hls.startLoad(plyr.currentTime);
        }
      });
    }
  };

  private createYoutubePlyr = (
    playback: YoutubePlayback,
    segmentStart?: number,
  ) => {
    this.player.getContainer().innerHTML = '';

    const media = document.createElement('div');
    media.setAttribute('data-qa', 'boclips-player');
    media.setAttribute('data-plyr-provider', 'youtube');
    media.setAttribute('data-plyr-embed-id', playback.id);
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

    this.resetPlyrInstance(media, playback);
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

  public configureWithVideo = (
    { playback }: Video,
    segment?: PlaybackSegment,
  ) => {
    if (this.hasBeenDestroyed) {
      return;
    }

    if (this.hls) {
      this.hls.destroy();
    }

    if (isStreamPlayback(playback)) {
      this.createStreamPlyr(playback, segment && segment.start);
    } else {
      this.createYoutubePlyr(playback, segment && segment.start);
    }

    if (segment) {
      const segmentStart = segment.start || 0;

      if (segment.start) {
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

            if (this.hls) {
              this.hls.stopLoad();
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

    this.hasBeenDestroyed = true;

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
      debug: this.player.getOptions().debug,
      captions: { active: false, language: 'en', update: true },
      controls: this.getOptions().controls,
      duration: playback ? playback.duration : null,
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
  };

  private getOptions = () => this.player.getOptions().interface;
}
