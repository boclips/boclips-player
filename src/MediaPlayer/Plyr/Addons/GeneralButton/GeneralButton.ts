import { AddonInterface } from '../Addons';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { EnrichedPlyr } from '../../../../types/plyr';
import './GeneralButton.less';
import { Playback } from '../../../../types/Playback';

export interface GeneralButtonOptions {
  child?: string | HTMLElement;
  onClick?: any;
}

export class GeneralButton implements AddonInterface {
  public static canBeEnabled = (
    _plyr: EnrichedPlyr,
    _playback: Playback,
    options: InterfaceOptions,
  ) => !!options.addons.generalButton && !options.controls.includes('restart');

  private options: GeneralButtonOptions = null;
  public generalButton: HTMLButtonElement = null;
  public inputContainer: HTMLElement = null;
  public overlayContainer: HTMLElement = null;
  private destroyed: boolean = false;

  public constructor(
    private plyr: EnrichedPlyr,
    _playback: Playback,
    options: InterfaceOptions,
  ) {
    this.addListeners();
    this.applyOptions(options);
  }

  private addListeners = () => {
    if (this.destroyed) {
      return;
    }
    this.plyr.on('ended', this.setUp);
  };

  private applyOptions = (options: InterfaceOptions) => {
    if (options.addons.generalButton !== null) {
      this.options = options.addons.generalButton;
    }
    return;
  };

  private setUp = () => {
    if (this.destroyed) {
      return;
    }
    this.controlListners();
    this.createButton();
  };

  private createButton = () => {
    this.generalButton = document.createElement('button');
    this.generalButton.id = 'general-button';
    this.generalButton.addEventListener('click', this.options.onClick);

    if (typeof this.options.child === 'string') {
      this.generalButton.innerHTML = this.options.child;
    } else {
      this.generalButton.appendChild(this.options.child);
    }

    this.createOverlay();
  };

  private createOverlay = () => {
    if (document.getElementById('replay-overlay') !== null) {
      this.overlayContainer = document.getElementById('replay-overlay');
      this.appendElements();
    } else {
      this.overlayContainer = document.createElement('Button');
      this.getPlyrContainer().appendChild(this.overlayContainer);
      this.overlayContainer.id = 'share-overlay';
      this.appendElements();
    }
  };

  private controlListners = () => {
    this.plyr.on('play', this.destroyContainer);
    this.plyr.on('progress', this.destroyContainer);
  };

  public removeListners = () => {
    this.plyr.off('play', this.destroyContainer);
    this.plyr.off('progress', this.destroyContainer);
  };

  public destroyContainer = () => {
    if (this.overlayContainer !== null) {
      this.overlayContainer.remove();
      this.overlayContainer = null;
      this.removeListners();
    }
  };

  private appendElements = () => {
    if (this.options.child !== null) {
      this.overlayContainer.appendChild(this.generalButton);
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
