export interface ErrorHandlerInstance {
  handleError: (error: any) => void;
  clearError: () => void;
}

export class ErrorHandler implements ErrorHandlerInstance {
  public static readonly CONTAINER_CLASS = 'error';

  public constructor(private container: HTMLElement) {}

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

  public handleError = error => {
    if (error && error.response && error.response.status === 404) {
      this.renderErrorContainer(
        'Video Unavailable',
        'This video is currently unavailable.',
      );
    } else {
      this.renderErrorContainer(
        'Unexpected Error Occurred',
        'Please try again later',
      );
    }
  };

  public clearError = () => {
    const errorContainer = this.container.querySelector(
      `.${ErrorHandler.CONTAINER_CLASS}`,
    );
    if (errorContainer) {
      this.container.removeChild(errorContainer);
    }
  };
}
