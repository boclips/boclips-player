import { AddonInterface } from '../Addons';
import { EnrichedPlyr } from '../../../../types/plyr';
import { InterfaceOptions } from '../../../InterfaceOptions';
import './RewatchButton.less';

export class RewatchButton implements AddonInterface {
  public static canBeEnabled = (_, __, options: InterfaceOptions) =>
    !!options.addons.rewatchButton && !options.controls.includes('restart');

  private overlayContainer: HTMLElement = null;
  private destroyed: boolean = false;

  public constructor(private plyr: EnrichedPlyr) {
    this.addListeners();
  }

  private addListeners = () => {
    if (this.destroyed) {
      return;
    }
    this.plyr.on('ended', this.setUpReplayOverlay);
  };

  public setUpReplayOverlay = () => {
    if (this.destroyed) {
      return;
    }
    this.controlListners();
    this.createOverlay();
  };
  public controlListners = () => {
    this.plyr.on('play', this.destroyContainer);
    this.plyr.on('progress', this.destroyContainer);
  };

  public createOverlay = () => {
    this.overlayContainer = document.createElement('Button');
    this.overlayContainer.id = 'replay-overlay';

    const rewatch = document.createElement('Button');
    rewatch.id = 'replay-overlay-button';
    const label = document.createElement('div');
    label.id = 'replay-overlay-label';

    rewatch.onclick = this.replayVideo;
    label.innerHTML = 'Rewatch';

    this.getPlyrContainer().append(this.overlayContainer);
    this.overlayContainer.append(rewatch);
    rewatch.append(label);
  };

  public replayVideo = () => {
    if (this.destroyed) {
      return;
    }

    this.plyr.play();
    this.destroyContainer();
  };

  public destroyContainer = () => {
    if (this.overlayContainer) {
      this.overlayContainer.parentElement.removeChild(this.overlayContainer);
      this.overlayContainer.remove();
    }
  };

  private getPlyrContainer = () => {
    if (this.destroyed) {
      return;
    }
    return this.plyr && this.plyr.elements && this.plyr.elements.container;
  };

  public destroy() {
    if (this.destroyed) {
      return;
    } else {
      this.destroyed = true;
      this.destroyContainer();
    }
  }
}
