import Hls from 'hls.js';
import { PrivatePlayer as Player } from '../../BoclipsPlayer/BoclipsPlayer';
import { StreamPlayback } from '../../types/Playback';
import { StreamingTechnique } from '../StreamingTechnique';
import { Logger } from '../../Logger';
import { NullLogger } from '../../NullLogger';

export class HlsWrapper implements StreamingTechnique {
  private hls: Hls = null;
  private hasBeenDestroyed: boolean = false;
  private playback: StreamPlayback;
  private errorCount;

  public static isSupported = () => Hls.isSupported();

  constructor(
    private player: Player,
    private readonly logger: Logger = new NullLogger(),
  ) {}

  public changeCaptions = (trackNumber: number) => {
    if (!this.canCallHls()) {
      return;
    }

    this.hls.subtitleTrack = trackNumber;
  };

  public initialise = (
    playback: StreamPlayback,
    startPosition: number = -1,
  ) => {
    if (this.hls) {
      this.destroy();
    }

    this.errorCount = {};

    this.playback = playback;

    this.hasBeenDestroyed = false;

    this.hls = new Hls({
      debug: this.player.getOptions().debug,
      autoStartLoad: false,
      startPosition,
    });

    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      this.hls.loadSource(this.playback.links.hlsStream.getOriginalLink());
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
    this.increaseErrorCount(error.details);

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
      this.logger.warn(
        `A non-fatal playback error occurred during playback of ${video.id}.`,
        error,
      );
      return;
    }

    if (error.type === Hls.ErrorTypes.NETWORK_ERROR) {
      const reloadSource = [
        Hls.ErrorDetails.MANIFEST_LOAD_ERROR,
        Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT,
        Hls.ErrorDetails.MANIFEST_PARSING_ERROR,
      ];

      if (reloadSource.indexOf(error.details) >= 0) {
        if (this.errorCount[error.details] < 3) {
          this.hls.loadSource(this.playback.links.hlsStream.getOriginalLink());

          return;
        } else {
          this.handleFatalHlsError(error);
        }
      }

      this.logger.warn(
        `A fatal network error encountered during playback of ${video.id}, try to recover.`,
        error,
      );

      this.hls.startLoad(this.player.getMediaPlayer().getCurrentTime());
    } else if (error.type === Hls.ErrorTypes.MEDIA_ERROR) {
      this.logger.warn(
        `A fatal media error encountered during playback of ${video.id}, try to recover.`,
        error,
      );
    } else {
      // cannot recover
      this.handleFatalHlsError(error);
    }

    throw new Error(
      `A fatal playback error occurred: VideoId: ${
        video ? video.id : '-'
      }. Type: ${error.type}. Details: ${error.details}. Reason: ${
        error.reason
      }. Error: ${error.err}`,
    );
  };

  private increaseErrorCount = (errorDetail) => {
    if (!this.errorCount[errorDetail]) {
      this.errorCount[errorDetail] = 0;
    }
    this.errorCount[errorDetail] = this.errorCount[errorDetail] + 1;
  };

  private handleFatalHlsError = (error) => {
    this.hls.destroy();

    this.player.getErrorHandler().handleError({
      fatal: error.fatal,
      type: error.type,
      payload: error,
    });
  };
}
