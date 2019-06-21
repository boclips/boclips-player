import deepmerge from 'deepmerge';
import { addListener as addResizeListener } from 'resize-detector';
import uuid from 'uuid/v1';
import { AxiosBoclipsClient } from '../BoclipsClient/AxiosBoclipsClient';
import { BoclipsClient } from '../BoclipsClient/BoclipsClient';
import { ErrorHandler } from '../ErrorHandler/ErrorHandler';
import { Analytics } from '../Events/Analytics';
import { Video } from '../types/Video';
import { Wrapper, WrapperConstructor } from '../Wrapper/Wrapper';
import './BoclipsPlayer.less';
import { BoclipsPlayerOptions, defaultOptions } from './BoclipsPlayerOptions';

export interface BoclipsPlayerInstance {
  play: () => Promise<any>;
  pause: () => void;
  loadVideo: (videoUri: string) => Promise<void>;
  destroy: () => void;
}

export class BoclipsPlayer implements BoclipsPlayerInstance {
  private readonly wrapperConstructor: WrapperConstructor;
  private readonly wrapper: Wrapper;
  private readonly container: HTMLElement;
  private readonly analytics: Analytics;
  private readonly errorHandler: ErrorHandler;
  private readonly boclipsClient: BoclipsClient;
  private options: Partial<BoclipsPlayerOptions> = {};
  private video: Video;
  private playerId: string = uuid();

  constructor(
    wrapperConstructor: WrapperConstructor,
    container: HTMLElement,
    options: Partial<BoclipsPlayerOptions> = {},
  ) {
    if (!wrapperConstructor) {
      throw Error(
        `IllegalArgument: Expected a valid WrapperConstructor. Given ${wrapperConstructor}`,
      );
    }
    if (false === container instanceof Node) {
      throw Error(
        `IllegalArgument: Container element ${container} must be a node`,
      );
    }

    if (!document.contains(container)) {
      console.warn(
        `Container element ${container} should be a node within the document body.`,
      );
    }

    this.wrapperConstructor = wrapperConstructor;
    this.container = container;
    this.options = deepmerge(defaultOptions, options);

    addResizeListener(container, this.handleResizeEvent);
    this.handleResizeEvent();

    container.classList.add('boclips-player-container');

    this.errorHandler = new ErrorHandler(this.container);
    this.boclipsClient = new AxiosBoclipsClient(this.options.boclips);

    if (!this.options.analytics.metadata) {
      this.options.analytics.metadata = {};
    }
    this.options.analytics.metadata.playerId = this.playerId;
    this.analytics = new Analytics(this.boclipsClient, this.options.analytics);

    this.wrapper = new this.wrapperConstructor(
      container,
      this.analytics,
      this.errorHandler,
      this.options.player,
    );

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

  public loadVideo = async (videoUri: string) => {
    if (this.video && this.video.links.self.getOriginalLink() === videoUri) {
      return;
    }

    this.video = null;

    return this.boclipsClient
      .retrieveVideo(videoUri)
      .then((video: Video) => {
        this.errorHandler.clearError();

        this.video = video;
        this.analytics.configure(video);
        this.wrapper.configureWithVideo(video);
      })
      .catch(error => {
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

  public destroy = () => this.wrapper.destroy();

  public getContainer = () => this.container;

  public getWrapper = () => this.wrapper;

  public getAnalytics = () => this.analytics;

  public getBoclipsClient = () => this.boclipsClient;

  public getVideo = (): Video => this.video;

  public play = (): Promise<void> => this.wrapper.play();

  public pause = (): void => this.wrapper.pause();
}
