import { AxiosError } from 'axios';
import { ErrorHandler } from './ErrorHandler';

describe('error message handling', () => {
  let container;
  let errorHandler;
  beforeEach(() => {
    container = document.createElement('section');
    errorHandler = new ErrorHandler(container);
  });

  const testData = [
    {
      when: 'video does not exist',
      expectTitle: 'Video Unavailable',
      expectBody: 'This video is currently unavailable.',
      status: 404,
    },
    {
      when: 'Unexpected error',
      expectTitle: 'Unexpected Error Occurred',
      expectBody: 'Please try again later',
      status: 500,
    },
  ];

  testData.forEach(({ when, expectTitle, expectBody, status }) => {
    it('will render an error message ' + when, async () => {
      const axiosError = {
        response: { status },
      } as AxiosError;

      errorHandler.handleError(axiosError, container);

      const errorContainer = container.querySelector('.error');
      expect(errorContainer).toBeTruthy();

      const title = errorContainer.querySelector('.title');
      expect(title.textContent).toEqual(expectTitle);

      const body = errorContainer.querySelector('.body');
      expect(body.textContent).toEqual(expectBody);
    });
  });

  it('removes the error box from the container', () => {
    const axiosError = {
      response: { status: 404 },
    } as AxiosError;
    errorHandler.handleError(axiosError, container);

    errorHandler.clearError(container);

    const errorContainer = container.querySelector('.error');
    expect(errorContainer).toBeFalsy();
  });

  it('only displays one error at a time', () => {
    const axiosError = {
      response: { status: 404 },
    } as AxiosError;

    errorHandler.handleError(axiosError, container);

    errorHandler.handleError(axiosError, container);

    const errorContainers = container.querySelectorAll('.error');
    expect(errorContainers).toHaveLength(1);
  });
});
