const CONTAINER_CLASS = 'error';

function renderErrorContainer(
  container: HTMLElement,
  title: string,
  content: string,
) {
  const errorContainer = document.createElement('section');
  errorContainer.classList.add(CONTAINER_CLASS);

  const titleElement = document.createElement('h1');
  titleElement.classList.add('title');
  titleElement.textContent = title;

  const bodyElement = document.createElement('p');
  bodyElement.classList.add('body');
  bodyElement.textContent = content;

  errorContainer.appendChild(titleElement);
  errorContainer.appendChild(bodyElement);

  clearError(container);
  container.appendChild(errorContainer);
}

export function errorHandler(error, container: HTMLElement) {
  if (error && error.response && error.response.status === 404) {
    renderErrorContainer(
      container,
      'Video Unavailable',
      'This video is currently unavailable.',
    );
  } else {
    renderErrorContainer(
      container,
      'Unexpected Error Occurred',
      'Please try again later',
    );
  }
}

export function clearError(container: HTMLElement) {
  const errorContainer = container.querySelector(`.${CONTAINER_CLASS}`);
  if (errorContainer) {
    container.removeChild(errorContainer);
  }
}
