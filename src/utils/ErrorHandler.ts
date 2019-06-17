export interface ErrorHandlerInstance {
  handleError: (error: Error) => void;
  clearError: () => void;
}

interface APIError {
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

  public constructor(private container: HTMLElement) {}

  public clearError = () => {
    const errorContainer = this.container.querySelector(
      `.${ErrorHandler.CONTAINER_CLASS}`,
    );
    if (errorContainer) {
      this.container.removeChild(errorContainer);
    }
  };

  public handleError = (error: Error) => {
    console.error(error);

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
      return;
    }

    this.renderErrorContainer(
      'Unexpected Error Occurred',
      'Please try again later',
    );
  };

  private renderErrorContainer = (title: string, content: string) => {
    const errorContainer = document.createElement('section');
    errorContainer.classList.add(ErrorHandler.CONTAINER_CLASS);

    const titleElement = document.createElement('h1');
    titleElement.classList.add('title');
    titleElement.textContent = title;

    const bodyElement = document.createElement('p');
    bodyElement.classList.add('body');
    bodyElement.textContent = content;

    errorContainer.appendChild(titleElement);
    errorContainer.appendChild(bodyElement);

    this.clearError();
    this.container.appendChild(errorContainer);
  };
}
