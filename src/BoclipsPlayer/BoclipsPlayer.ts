import { BoclipsError } from './../ErrorHandler/BoclipsPlayerError';
import deepmerge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import { addListener as addResizeListener } from 'resize-detector';
import { v1 as uuidV1 } from 'uuid';
import { AxiosBoclipsApiClient } from '../BoclipsApiClient/AxiosBoclipsApiClient';
import { BoclipsApiClient } from '../BoclipsApiClient/BoclipsApiClient';
import { Logger } from '../Logger';
import { NullLogger } from '../NullLogger';
import { ErrorHandler } from '../ErrorHandler/ErrorHandler';
import { Analytics } from '../Events/Analytics';
import { MediaPlayer, PlaybackSegment } from '../MediaPlayer/MediaPlayer';
import { MediaPlayerFactory } from '../MediaPlayer/MediaPlayerFactory';
import { DeepPartial } from '../types/Utils';
import { Video } from '../types/Video';
import './BoclipsPlayer.less';
import { defaultOptions, PlayerOptions } from './PlayerOptions';
import { Constants } from './Constants';

export interface Player {
  play: () => Promise<any>;
  pause: () => void;
  loadVideo: (videoUri: string, segment?: PlaybackSegment) => Promise<void>;
  destroy: () => void;
  onEnd: (callback: (endOverlay: HTMLDivElement) => void) => void;
}

export interface PrivatePlayer extends Player {
  getContainer: () => HTMLElement;
  getClient: () => BoclipsApiClient;
  getAnalytics: () => Analytics;
  getErrorHandler: () => ErrorHandler;
  getPlayerId: () => string;
  getOptions: () => PlayerOptions;
  getVideo: () => Video | undefined;
  getMediaPlayer: () => MediaPlayer;
}

export class BoclipsPlayer implements PrivatePlayer {
  private readonly options: PlayerOptions;
  private readonly mediaPlayer: MediaPlayer;
  private readonly analytics: Analytics;
  private readonly errorHandler: ErrorHandler;
  private readonly boclipsClient: BoclipsApiClient;
  private video: Video;
  private playerId: string = uuidV1();

  constructor(
    private readonly container: HTMLElement,
    options: DeepPartial<PlayerOptions> = {},
    private readonly logger: Logger = new NullLogger(),
  ) {
    if (false === container instanceof Node) {
      throw Error(
        `IllegalArgument: Container element ${container} must be a node`,
      );
    }

    if (!document.contains(container)) {
      logger.warn(
        `Container element ${container} should be a node within the document body.`,
      );
    }

    addResizeListener(container, this.handleResizeEvent);
    this.handleResizeEvent();

    container.classList.add('boclips-player-container');

    this.options = deepmerge.all([defaultOptions, options], {
      arrayMerge: (_, source) => source,
      isMergeableObject: isPlainObject,
    }) as PlayerOptions;

    this.errorHandler = new ErrorHandler(this, this.logger);
    this.boclipsClient = new AxiosBoclipsApiClient(this, this.logger);
    this.analytics = new Analytics(this);
    this.mediaPlayer = new (MediaPlayerFactory.get())(this);

    const videoUriAttribute = container.getAttribute('data-boplayer-video-uri');
    if (videoUriAttribute) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadVideo(videoUriAttribute);
    }
  }

  private handleResizeEvent = () => {
    const height = this.container.clientHeight;
    const fontSize = Math.max(0.04 * height, 12);
    this.container.style.fontSize = fontSize + 'px';

    const width = this.container.clientWidth;

    this.container.classList.remove(
      'large-player',
      'medium-player',
      'small-player',
    );

    if (width > 500) {
      this.container.classList.add('large-player');
    } else if (width < 300) {
      this.container.classList.add('small-player');
    } else {
      this.container.classList.add('medium-player');
    }
  };

  public loadVideo = async (videoUri: string, segment?: PlaybackSegment) => {
    if (this.video && this.video.links.self.getOriginalLink() === videoUri) {
      return;
    }

    this.video = null;

    return this.boclipsClient
      .retrieveVideo(videoUri)
      .then((video: Video) => {
        this.errorHandler.clearError();

        this.video = video;
        this.mediaPlayer.configureWithVideo(video, segment);
      })
      .catch((error) => {
        if (this.errorHandler.isDefinedError(error)) {
          this.errorHandler.handleError(error);
          return;
        }
        if (error && error.response && error.response.status) {
          if (error.response.status === 404) {
            this.errorHandler.handleError({
              fatal: true,
              type: 'API_ERROR',
              payload: {
                statusCode: 404,
              },
            });
          } else {
            this.errorHandler.handleError({
              fatal: true,
              type: 'API_ERROR',
              payload: {
                statusCode: error.response.status,
              },
            });
          }
        } else {
          this.errorHandler.handleError({
            fatal: true,
            type: 'UNKNOWN_ERROR',
            payload: error,
          });
        }
      });
  };

  public getPlayerId = () => this.playerId;

  public destroy = () => {
    this.container.removeAttribute(
      Constants.BOCLIPS_PLAYER_INTIALISED_ATTRIBUTE,
    );
    return this.mediaPlayer.destroy();
  };

  public onEnd = (callback: (endOverlay: HTMLDivElement) => void) => {
    this.mediaPlayer.onEnd(callback);
  };

  public onError = (callback: (error: BoclipsError) => void) => {
    this.errorHandler.onError(callback);
  };

  public getContainer = () => this.container;

  public getMediaPlayer = () => this.mediaPlayer;

  public getAnalytics = () => this.analytics;

  public getErrorHandler = () => this.errorHandler;

  public getClient = () => this.boclipsClient;

  public getVideo = (): Video => this.video;

  public play = (): Promise<void> => this.mediaPlayer.play();

  public pause = (): void => this.mediaPlayer.pause();

  public getOptions = () => this.options;
}
