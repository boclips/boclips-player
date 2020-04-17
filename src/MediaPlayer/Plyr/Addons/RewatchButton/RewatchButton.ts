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
    this.plyr.on('ended', this.createContainer);
    // document
    //   .querySelector(
    //     '#player-container > div > div.plyr__controls button.plyr__controls__item.plyr__control',
    //   )
    //   .addEventListener('click', this.destroyContainer, false);
    // document
    //   .querySelector(
    //     '#player-container > div > div.plyr__controls > div.plyr__controls__item.plyr__progress__container > div',
    //   )
    //   .addEventListener('click', this.destroyContainer, false);
  };
  public createContainer = () => {
    this.overlayContainer = document.createElement('Button');
    this.overlayContainer.id = 'replay-overlay';

    const rewatch = document.createElement('Button');
    rewatch.id = 'replay-overlay-button';

    rewatch.onclick = this.replayVideo;
    rewatch.innerHTML = 'Rewatch';

    this.getPlyrContainer().append(this.overlayContainer);
    this.overlayContainer.append(rewatch);

    const button: HTMLButtonElement = document.querySelector(
      '#player-container > div > button',
    );

    if (button) {
      button.style.visibility = 'hidden';
    }
  };

  public replayVideo = () => {
    if (this.overlayContainer) {
      this.plyr.play();
      this.destroyContainer();
    }
  };

  public destroyContainer = () => {
    if (this.overlayContainer) {
      this.overlayContainer.parentElement.removeChild(this.overlayContainer);
      this.overlayContainer.remove();
    }
  };

  private getPlyrContainer = () =>
    this.plyr && this.plyr.elements && this.plyr.elements.container;

  public destroy() {
    if (this.destroyed) {
      return;
    } else {
      this.destroyed = true;
    }
  }
}
