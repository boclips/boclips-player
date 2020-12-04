import { PrivatePlayer } from '../BoclipsPlayer/BoclipsPlayer';
import './ErrorHandler.less';
import ErrorIcon from './ErrorIcon';
import { NullLogger } from '../NullLogger';
import { Logger } from '../Logger';

export interface ErrorHandlerInstance {
  handleError: (error: Error) => void;
  clearError: () => void;
  isDefinedError: (error: any) => boolean;
}

export interface APIError {
  fatal: boolean;
  type: 'API_ERROR';
  payload: {
    statusCode: number;
  };
}

interface PlaybackError {
  fatal: boolean;
  type: 'PLAYBACK_ERROR';
  payload: {
    code: number;
    message: string;
  };
}

interface HLSError {
  fatal: boolean;
  type: 'NETWORK_ERROR' | 'MEDIA_ERROR' | 'MUX_ERROR' | 'OTHER_ERROR';
  payload: any;
}

interface UnknownError {
  fatal: true;
  type: 'UNKNOWN_ERROR';
  payload: any;
}

export type Error = APIError | PlaybackError | HLSError | UnknownError;

export class ErrorHandler implements ErrorHandlerInstance {
  public static readonly CONTAINER_CLASS = 'error';

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

  public isDefinedError = (error: any): error is Error =>
    error.hasOwnProperty('fatal') &&
    error.hasOwnProperty('type') &&
    error.hasOwnProperty('payload');

  public handleError = (error: Error) => {
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
    errorContainer.classList.add(ErrorHandler.CONTAINER_CLASS);

    errorContainer.insertAdjacentHTML('afterbegin', ErrorIcon);
    errorContainer.appendChild(text);

    this.clearError();
    this.player.getContainer().appendChild(errorContainer);
  };
}
