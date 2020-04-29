import { EndOverlay } from './../SharedFeatures/SharedFeatures';
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
  ) =>
    !!options.addons.generalButtons &&
    !options.controls.includes('restart') &&
    Array.isArray(options.addons.generalButtons) &&
    options.addons.generalButtons.length > 0;

  public options: GeneralButtonOptions[] = [];
  public generalButtonsContainer: HTMLDivElement = null;
  public inputContainer: HTMLElement = null;
  public overlay: HTMLElement = null;
  private destroyed: boolean = false;
  public plyrContainer =
    this.plyr && this.plyr.elements && this.plyr.elements.container;

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
    if (this.destroyed) {
      return;
    }
    this.options = options.addons.generalButtons;
  };

  private setUp = () => {
    this.controlListners();
    this.createButtonsContainer();
  };
  private controlListners = () => {
    this.plyr.on('play', this.destroyContainer);
    this.plyr.on('progress', this.destroyContainer);
  };

  private createButtonsContainer = () => {
    this.generalButtonsContainer = document.createElement('div');
    this.generalButtonsContainer.id = 'general-buttons-container';
    this.createButtons();
  };

  private createButtons = () => {
    this.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'icons-container';
      button.addEventListener('click', option.onClick);
      if (typeof option.child === 'string') {
        button.innerHTML = option.child;
      } else {
        button.appendChild(option.child);
      }
      this.generalButtonsContainer.appendChild(button);
    });
    this.createOverlay();
  };

  private createOverlay = () => {
    this.overlay = EndOverlay.createIfNotExists(this.plyrContainer);
    this.appendElements();
  };

  private appendElements = () => {
    if (this.destroyed) {
      return;
    }
    this.overlay.appendChild(this.generalButtonsContainer);
  };

  public removeListners = () => {
    this.plyr.off('play', this.destroyContainer);
    this.plyr.off('progress', this.destroyContainer);
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
