import { BoclipsError } from './../ErrorHandler/BoclipsPlayerError';
import deepmerge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import { addListener as addResizeListener } from 'resize-detector';
import { v4 as uuidv4 } from 'uuid';
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
import './BoclipsPlayer.scss';
import { defaultOptions, PlayerOptions } from './PlayerOptions';
import { Constants } from './Constants';
import { Annoto, IAnnotoApi, IConfig, IMediaDetails } from '@annoto/widget-api';
import jwt_decode from 'jwt-decode';
import sign from 'jwt-encode';

export interface Player {
  play: () => Promise<any>;
  pause: () => void;
  loadVideo: (
    videoUri: string,
    segment?: PlaybackSegment,
    annotoClientId?: string,
    annotoSecret?: string,
    user?: 'user' | 'super-mod',
  ) => Promise<void>;
  destroy: () => void;
  onEnd: (callback: (endOverlay: HTMLDivElement) => void) => void;
  onError: (callback: (error: BoclipsError) => void) => void;
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
  private playerId: string = uuidv4();

  constructor(
    private readonly container: HTMLElement,
    options: DeepPartial<PlayerOptions> = {},
    private readonly logger: Logger = new NullLogger(),
  ) {
    if (!(container instanceof Node)) {
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

  public loadVideo = async (
    videoUri: string,
    segment?: PlaybackSegment,
    annotoClientId?: string,
    annotoSecret?: string,
    user?: 'user' | 'super-mod',
  ): Promise<any> => {
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

        interface Global extends Window {
          Annoto: Annoto;
        }

        const global: Global = window as any;

        const annotoConfig: IConfig = {
          group: {
            id: '2613a9a5-7245-4af2-81a7-96279bcb7fd2',
            title: this.video.title, // Course title
            description: this.video.description,
          },
          hooks: {
            mediaDetails: (): IMediaDetails | Promise<IMediaDetails> => {
              return {
                // unique media identifier
                // for example for kaltura media can be: `/partnerId/${partnerId}/entryId/${id}`
                id: this.video.id,
                title: this.video.title, // Course title
                description: this.video.description,
              };
            },
          },
          clientId: annotoClientId,
          widgets: [
            {
              // Side panel layout is not supported yet for plyr
              // We will add support soon, and will let you know when it's ready
              features: {
                notes: { enabled: false },
                timeline: { enabled: false },
                stats: { enabled: false },
                comments: { enabled: false },
              },
              ux: {
                layout: 'sidePanel',
                tabs: false,
              },
              player: {
                // @ts-ignore
                type: 'plyr',
                element: '[data-qa="boclips-player"]',
                params: {
                  // Please make sure it's the Plyr class instance object
                  plyr: this.mediaPlayer.wrapper(),
                },
              },
              timeline: { overlay: true },
            },
          ],
        };

        let annotoApi: IAnnotoApi;
        let annotoSSOToken: string;

        this.options.api.tokenFactory().then((s) => {
          const decodedBoclipsToken: any = jwt_decode(s);
          console.log(decodedBoclipsToken);

          const annotoTokenDecoded = {
            // The expiration for production can be much shorter.
            // It just needs to be long enough to process the authetication request
            exp: Math.round(Date.now() / 1000 + 60 * 20),
            iss: annotoClientId,
            jti: decodedBoclipsToken.jti,
            name: decodedBoclipsToken.name,
            // valid scopes: “user”, “moderator”, “super-mod”
            scope: user,
            email: 'alex@boclips.com',
            // aud: 'http://annoto.net', not mandatory
          };

          // The secret must be kept only on your backend.
          // So for production, please move the jwt sign to the backend.
          // For quick testing it's ok of course :)
          annotoSSOToken = sign(annotoTokenDecoded, annotoSecret);
          console.log('jwt-encode output: ', annotoSSOToken);

          const token = annotoSSOToken;

          const authAnnoto = () => {
            if (annotoApi && annotoSSOToken) {
              return annotoApi.auth(token).then(() => {
                console.log('Annoto authenticated');
              });
            }
            console.log('Annoto api or sso token not ready yet');
          };

          // can be called when page with video is loaded
          const loadOrBootAnnoto = (config: IConfig) => {
            if (annotoApi) {
              return annotoApi.load(config).then(() => {
                console.log('Annoto configuration reloaded');
              });
            }
            // @ts-ignore
            global.Annoto.on('ready', (api: IAnnotoApi) => {
              console.log('Annoto API is ready!');
              annotoApi = api;
              authAnnoto();
              console.log(annotoApi.getMetadata());
            });
            console.log('bootstrapping Annoto');
            return global.Annoto.boot(config);
          };

          // Somewhere on the page with video where annoto needs to be loaded
          loadOrBootAnnoto(annotoConfig);

          // No need to reload the widget after authentication
          // reloadConfig(cannotAPI);
        });
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

  public getVideoTitle = () => this.getVideo().title;
}
