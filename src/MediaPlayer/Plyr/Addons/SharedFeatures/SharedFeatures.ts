import './SharedFeatures.less';
export class EndOverlay {
  public static createIfNotExists = plyrContainer => {
    let overlay = null;
    if (document.getElementById('overlay') !== null) {
      overlay = document.getElementById('overlay');
    } else {
      overlay = document.createElement('Button');
      overlay.id = 'overlay';
    }
    plyrContainer.appendChild(overlay);
    return overlay;
  };
}
