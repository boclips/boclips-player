import './SharedFeatures.less';
export class EndOverlay {
  public static elementId: string = 'overlay';

  public static destroyIfExists = plyrContainer => {
    const overlay = document.getElementById(EndOverlay.elementId);
    if (overlay) {
      plyrContainer.removeChild(overlay);
    } else {
      return;
    }
  };

  public static createIfNotExists = plyrContainer => {
    let overlay = null;
    if (document.getElementById(EndOverlay.elementId) !== null) {
      overlay = document.getElementById(EndOverlay.elementId);
    } else {
      overlay = document.createElement('div');
      overlay.id = EndOverlay.elementId;
    }
    plyrContainer.appendChild(overlay);
    return overlay;
  };
}
