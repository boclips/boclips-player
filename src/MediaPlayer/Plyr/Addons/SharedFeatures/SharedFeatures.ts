import './SharedFeatures.less';

export class EndOverlay {
  public static overlayClassName: string = 'end-video-overlay';

  public static destroyIfExists = (plyrContainer?: HTMLElement) => {
    if (plyrContainer == null) {
      return;
    }

    const endOfVideoOverlay = plyrContainer.querySelector(
      `.${EndOverlay.overlayClassName}`,
    );

    if (endOfVideoOverlay) {
      plyrContainer.removeChild(endOfVideoOverlay);
    }
  };

  public static createIfNotExists = (
    plyrContainer?: HTMLElement,
  ): HTMLDivElement => {
    const endOfVideoOverlay = plyrContainer.querySelector<HTMLDivElement>(
      `.${EndOverlay.overlayClassName}`,
    );

    if (endOfVideoOverlay) {
      return endOfVideoOverlay;
    } else {
      const newEndOfVideoOverlay = document.createElement('div');
      newEndOfVideoOverlay.className = EndOverlay.overlayClassName;

      plyrContainer.appendChild(newEndOfVideoOverlay);
      return newEndOfVideoOverlay;
    }
  };
}
