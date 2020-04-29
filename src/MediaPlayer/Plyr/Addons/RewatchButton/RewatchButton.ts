import { AddonInterface } from '../Addons';
import { EnrichedPlyr } from '../../../../types/plyr';
import { InterfaceOptions } from '../../../InterfaceOptions';
import './RewatchButton.less';
import { CreateOverlay } from '../SharedFeatures/SharedFeatures';

export class RewatchButton implements AddonInterface {
  public static canBeEnabled = (_, __, options: InterfaceOptions) =>
    !!options.addons.rewatchButton && !options.controls.includes('restart');

  private overlay: HTMLElement = null;
  private destroyed: boolean = false;
  public plyrContainer =
    this.plyr && this.plyr.elements && this.plyr.elements.container;

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

  public removeListners = () => {
    this.plyr.off('play', this.destroyContainer);
    this.plyr.off('progress', this.destroyContainer);
  };

  private createOverlay = () => {
    CreateOverlay.containerExists(this.plyrContainer);
    this.overlay = this.plyrContainer
      .getElementsByTagName('button')
      .namedItem('overlay');
    this.createRewatchButton();
  };

  public createRewatchButton = () => {
    const rewatch = document.createElement('Button');
    rewatch.id = 'replay-overlay-button';

    rewatch.onclick = this.replayVideo;
    rewatch.innerHTML = 'Watch Again';

    this.overlay.append(rewatch);
  };

  public replayVideo = () => {
    if (this.destroyed) {
      return;
    }

    this.plyr.play();
  };

  public destroyContainer = () => {
    if (this.overlay !== null) {
      this.overlay.remove();
      this.overlay = null;
      this.removeListners();
    }
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
