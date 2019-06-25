import { BoclipsPlayer, PrivatePlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { Error, ErrorHandler } from './ErrorHandler';

describe('error message handling', () => {
  let container: HTMLElement;
  let player: PrivatePlayer;
  let errorHandler;
  beforeEach(() => {
    container = document.createElement('section');
    player = new BoclipsPlayer(container);
    errorHandler = new ErrorHandler(player);
  });

  const testData: Array<{
    when: string;
    expectTitle: string;
    expectBody: string;
    error: Error;
  }> = [
    {
      when: '404 API error',
      expectTitle: 'Video Unavailable',
      expectBody: 'This video is currently unavailable.',
      error: {
        type: 'API_ERROR',
        fatal: true,
        payload: {
          statusCode: 404,
        },
      },
    },
    {
      when: '500 API error',
      expectTitle: 'Unexpected Error Occurred',
      expectBody: 'Please try again later',
      error: {
        type: 'API_ERROR',
        fatal: true,
        payload: {
          statusCode: 500,
        },
      },
    },
    {
      when: 'HLS stream error',
      expectTitle: 'Unexpected Error Occurred',
      expectBody: 'Please try again later',
      error: {
        type: 'NETWORK_ERROR',
        fatal: true,
        payload: {},
      },
    },
    {
      when: 'YouTube 150',
      expectTitle: 'Video Unavailable',
      expectBody: 'This video is currently unavailable.',
      error: {
        type: 'PLAYBACK_ERROR',
        fatal: true,
        payload: {
          code: 150,
          message: 'blah',
        },
      },
    },
  ];

  testData.forEach(({ when, expectTitle, expectBody, error }) => {
    it('will render an error message ' + when, async () => {
      errorHandler.handleError(error);

      expectError(expectTitle, expectBody);
    });
  });

  it('removes the error box from the container', () => {
    errorHandler.handleError({
      type: 'API_ERROR',
      fatal: true,
      payload: {
        statusCode: 404,
      },
    });

    errorHandler.clearError(container);

    const errorContainer = container.querySelector('.error');
    expect(errorContainer).toBeFalsy();
  });

  it('only displays one error at a time', () => {
    const error = {
      type: 'API_ERROR',
      fatal: true,
      payload: {
        statusCode: 404,
      },
    };

    errorHandler.handleError(error);

    errorHandler.handleError(error);

    const errorContainers = container.querySelectorAll('.error');
    expect(errorContainers).toHaveLength(1);
  });

  const expectError = (title: string, body: string) => {
    const errorContainer = container.querySelector('.error');
    expect(errorContainer).toBeTruthy();

    const titleElement = errorContainer.querySelector('.title');
    expect(titleElement.textContent).toEqual(title);

    const bodyElement = errorContainer.querySelector('.body');
    expect(bodyElement.textContent).toEqual(body);
  };
});
