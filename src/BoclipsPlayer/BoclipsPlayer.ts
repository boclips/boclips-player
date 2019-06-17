import deepmerge from 'deepmerge';
import uuid from 'uuid/v1';
import { Analytics } from '../Events/Analytics';
import { Video } from '../types/Video';
import { ErrorHandler } from '../utils/ErrorHandler';
import retrieveVideo from '../utils/retrieveVideo';
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
  // @ts-ignore
  private options: BoclipsPlayerOptions = {};
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

    container.classList.add('boclips-player-container');

    this.analytics = new Analytics(this.playerId, this.options.analytics);
    this.errorHandler = new ErrorHandler(this.container);

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

  public loadVideo = async (videoUri: string) => {
    if (this.video && this.video.links.self.getOriginalLink() === videoUri) {
      return;
    }

    this.video = null;

    return retrieveVideo(videoUri)
      .then((video: Video) => {
        this.errorHandler.clearError();

        this.video = video;
        this.analytics.configure(video);
        this.wrapper.configureWithVideo(video);
      })
      .catch(error => {
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

  public destroy = () => this.wrapper.destroy();

  public getContainer = () => this.container;

  public getWrapper = () => this.wrapper;

  public getAnalytics = () => this.analytics;

  public getVideo = (): Video => this.video;

  public play = (): Promise<void> => this.wrapper.play();

  public pause = (): void => this.wrapper.pause();
}
