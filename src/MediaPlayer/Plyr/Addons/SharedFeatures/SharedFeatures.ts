import './SharedFeatures.less';

export class EndOverlay {
  public static overlayClassName: string = 'end-video-overlay';

  public static destroyIfExists = plyrContainer => {
    let endOfVideoOverlay = null;
    plyrContainer.className = 'plyr-container';

    endOfVideoOverlay = document.querySelector(
      '.' + plyrContainer.className + ' > .end-video-overlay',
    );
    console.log(endOfVideoOverlay);
    plyrContainer.className = null;
    if (endOfVideoOverlay) plyrContainer.removeChild(endOfVideoOverlay);
  };

  public static createIfNotExists = plyrContainer => {
    let endOfVideoOverlay = null;
    plyrContainer.className = 'plyr-container';

    endOfVideoOverlay = document.querySelector(
      '.' + plyrContainer.className + ' > .end-video-overlay',
    );
    plyrContainer.className = null;
    if (endOfVideoOverlay) return endOfVideoOverlay;
    else {
      endOfVideoOverlay = document.createElement('div');
      endOfVideoOverlay.className = EndOverlay.overlayClassName;

      plyrContainer.appendChild(endOfVideoOverlay);
      return endOfVideoOverlay;
    }
  };
}
