import Hls from 'hls.js';
import { PrivatePlayer as Player } from '../../BoclipsPlayer/BoclipsPlayer';
import { StreamPlayback } from '../../types/Playback';
import { StreamingTechnique } from '../StreamingTechnique';

export class HlsWrapper implements StreamingTechnique {
  private hls: Hls = null;
  private hasBeenDestroyed: boolean = false;

  public static isSupported = () => Hls.isSupported();

  constructor(private player: Player) {}

  public initialise = (
    playback: StreamPlayback,
    startPosition: number = -1,
  ) => {
    if (this.hls) {
      this.destroy();
    }

    this.hasBeenDestroyed = false;

    this.hls = new Hls({
      debug: this.player.getOptions().debug,
      autoStartLoad: false,
      startPosition,
    });

    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      this.hls.loadSource(playback.streamUrl);
    });

    this.hls.on(Hls.Events.ERROR, this.hlsErrorHandler);

    this.hls.attachMedia(this.player.getMediaPlayer().getVideoContainer());
  };

  public startLoad = (startTime: number) => {
    if (!this.canCallHls()) {
      return;
    }

    this.hls.startLoad(startTime);
  };

  public stopLoad = () => {
    if (!this.canCallHls()) {
      return;
    }

    this.hls.stopLoad();
  };

  public destroy = () => {
    if (!this.canCallHls()) {
      return;
    }

    this.hasBeenDestroyed = true;
    this.hls.destroy();
  };

  private canCallHls = () => !this.hasBeenDestroyed && this.hls;

  private hlsErrorHandler = (_, error) => {
    const video = this.player.getVideo();

    let fatal = error.fatal;

    if (
      error.type === Hls.ErrorTypes.MEDIA_ERROR &&
      error.details === 'fragParsingError'
    ) {
      // A fragParsingError is usually recoverable, even if fatal is true.
      fatal = false;
    }

    if (!fatal) {
      console.warn(
        `A non-fatal playback error occurred during playback of ${video.id}.`,
        error,
      );
      return;
    }

    switch (error.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        if (error.details === 'manifestLoadError') {
          this.handleFatalHlsError(error);

          return;
        }

        console.warn(
          `A fatal network error encountered during playback of ${
            video.id
          }, try to recover.`,
          error,
        );
        this.hls.startLoad(this.player.getMediaPlayer().getCurrentTime());
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.warn(
          `A fatal media error encountered during playback of ${
            video.id
          }, try to recover.`,
          error,
        );
        break;
      default:
        // cannot recover
        this.handleFatalHlsError(error);
        break;
    }

    throw new Error(
      `A fatal playback error occurred: VideoId: ${
        video ? video.id : '-'
      }. Type: ${error.type}. Details: ${error.details}. Reason: ${
        error.reason
      }. Error: ${error.err}`,
    );
  };

  private handleFatalHlsError = error => {
    this.hls.destroy();

    this.player.getErrorHandler().handleError({
      fatal: error.fatal,
      type: error.type,
      payload: error,
    });
  };
}
