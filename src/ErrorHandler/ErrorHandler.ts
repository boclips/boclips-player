import { ErrorConverter } from './ErrorConverter';
import { PrivatePlayer } from '../BoclipsPlayer/BoclipsPlayer';
import './ErrorHandler.less';
import ErrorIcon from './ErrorIcon';
import { NullLogger } from '../NullLogger';
import { Logger } from '../Logger';
import { EnrichedPlyr } from '../types/plyr';
import { InternalError } from './InternalError';
import { BoclipsError } from './BoclipsPlayerError';

export interface ErrorHandlerInstance {
  handleError: (error: InternalError) => void;
  clearError: () => void;
  isDefinedError: (error: any) => boolean;
  onError: (callback: (error: BoclipsError) => void) => void;
}

export class ErrorHandler implements ErrorHandlerInstance {
  public static readonly CONTAINER_CLASS = 'error';
  public static readonly CONTAINER_ID = 'boclips-error-container';
  private onErrorCallback?: (error: BoclipsError) => void;

  public constructor(
    private player: PrivatePlayer,
    private logger: Logger = new NullLogger(),
  ) {}

  public clearError = () => {
    const errorContainer = this.player
      .getContainer()
      .querySelector(`.${ErrorHandler.CONTAINER_CLASS}`);
    if (errorContainer) {
      this.player.getContainer().removeChild(errorContainer);
    }
  };

  public onError = (callback: (error: BoclipsError) => void) => {
    this.onErrorCallback = callback;
  };

  public isDefinedError = (error: any): error is InternalError =>
    error.hasOwnProperty('fatal') &&
    error.hasOwnProperty('type') &&
    error.hasOwnProperty('payload');

  public blockDisplay = (
    player: EnrichedPlyr,
    segmentStart: number,
    segmentEnd: number,
  ) => {
    this.renderBlockView(
      'Video Unavailable',
      'You must log in to view this video',
      player,
      segmentStart,
      segmentEnd,
    );
  };

  public handleError = (error: InternalError) => {
    this.logger.error(error);

    if (!error.fatal) {
      return;
    }

    if (
      (error.type === 'API_ERROR' && error.payload.statusCode === 404) ||
      error.type === 'PLAYBACK_ERROR'
    ) {
      this.renderErrorContainer(
        'Video Unavailable',
        'This video is currently unavailable.',
      );
    } else if (
      error.type === 'API_ERROR' &&
      (error.payload.statusCode === 403 || error.payload.statusCode === 401)
    ) {
      this.renderErrorContainer(
        'Video Unavailable',
        'You must log in to view this video',
      );
    } else {
      this.renderErrorContainer(
        'Unexpected Error Occurred',
        'Please try again later',
      );
    }

    if (this.onErrorCallback && typeof this.onErrorCallback === 'function') {
      this.onErrorCallback(ErrorConverter.convert(error));
    }
  };

  private renderErrorContainer = (title: string, content: string) => {
    const titleElement = document.createElement('h1');
    titleElement.classList.add('title');
    titleElement.textContent = title;

    const bodyElement = document.createElement('p');
    bodyElement.classList.add('body');
    bodyElement.textContent = content;

    const text = document.createElement('div');
    text.appendChild(titleElement);
    text.appendChild(bodyElement);

    const errorContainer = document.createElement('section');
    errorContainer.id = ErrorHandler.CONTAINER_ID;
    errorContainer.classList.add(ErrorHandler.CONTAINER_CLASS);

    errorContainer.insertAdjacentHTML('afterbegin', ErrorIcon);
    errorContainer.appendChild(text);

    this.clearError();
    this.player.getContainer().prepend(errorContainer);
  };

  private renderBlockView = (
    title: string,
    content: string,
    player: EnrichedPlyr,
    start,
    end,
  ) => {
    const titleElement = document.createElement('h1');
    titleElement.classList.add('title');
    titleElement.textContent = title;

    const bodyElement = document.createElement('p');
    bodyElement.classList.add('body');
    bodyElement.textContent = content;

    const startEl = document.createElement('button');
    const endEl = document.createElement('button');

    const startOnClick = () => {
      player.currentTime = start;
      player.pause();
      document.querySelector('.error').remove();
    };

    startEl.textContent = start;
    startEl.addEventListener('click', startOnClick);
    endEl.textContent = end;

    const text = document.createElement('div');
    text.appendChild(titleElement);
    text.appendChild(bodyElement);

    text.appendChild(startEl);
    text.appendChild(endEl);

    const errorContainer = document.createElement('section');
    errorContainer.classList.add(ErrorHandler.CONTAINER_CLASS);

    errorContainer.insertAdjacentHTML('afterbegin', ErrorIcon);
    errorContainer.appendChild(text);

    this.clearError();
    this.player.getContainer().prepend(errorContainer);
  };
}
