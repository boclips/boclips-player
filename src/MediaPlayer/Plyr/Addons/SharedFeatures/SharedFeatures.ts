import './SharedFeatures.less';
export class CreateOverlay {
  public static containerExists = plyrContainer => {
    let overlay = null;
    if (document.getElementById('overlay') !== null) {
      overlay = document.getElementById('overlay');
    } else if (document.getElementById('overlay') === null) {
      overlay = document.createElement('Button');
      overlay.id = 'overlay';
    }
    plyrContainer.appendChild(overlay);
  };
}
