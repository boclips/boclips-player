import { AddonInterface } from '../Addons';
import { EnrichedPlyr } from '../../../../types/plyr';
import { InterfaceOptions } from '../../../InterfaceOptions';

export interface RewatchButtonOptions {}

export class RewatchButton implements AddonInterface {
  public static canBeEnabled = (_, __, options: InterfaceOptions) =>
    options.addons.rewatchButton && !options.controls.includes('restart');

  private container: HTMLElement = null;

  public constructor(private plyr: EnrichedPlyr) {
    this.addListeners();
    this.replayVideo();
  }

  private addListeners = () => {
    this.plyr.media.addEventListener('ended', this.createContainer, false);
    document
      .querySelector('#player-container > div > div.plyr__controls')
      .addEventListener('click', this.destroyContainer, false);
  };
  public createContainer = () => {
    {
      this.container = document.createElement('BUTTON');
      this.container.style.position = 'absolute';
      this.container.style.top = '0';
      this.container.style.left = '0';
      this.container.style.height = '100%';
      this.container.style.width = '100%';
      this.container.style.opacity = '0.8';
      this.container.style.backgroundColor = 'grey';

      const rewatch = document.createElement('Button');
      rewatch.style.cursor = 'pointer';
      rewatch.style.backgroundColor = 'grey';
      rewatch.style.width = '10%';
      rewatch.style.overflow = 'hidden';
      rewatch.onclick = this.replayVideo;

      rewatch.innerHTML = 'Rewatch';
      this.getPlyrContainer().append(this.container);
      this.container.append(rewatch);
      const button = document.querySelector('#player-container > div > button');

      button.style.visibility = 'hidden';
    }
  };
  public replayVideo = () => {
    if (this.container) {
      this.plyr.play();
      this.destroyContainer();
    }
  };

  public destroyContainer = () => {
    this.container.parentElement.removeChild(this.container);
    this.container = null;
  };

  private getPlyrContainer = () =>
    this.plyr && this.plyr.elements && this.plyr.elements.container;

  private destroyed: boolean = false;
  public destroy() {
    if (this.destroyed) {
      return;
    } else {
      this.destroyed = true;
    }
  }
}
