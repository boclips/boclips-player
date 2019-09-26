import Plyr from 'plyr';
import { Playback } from '../../../types/Playback';
import { getBoundedValue, withPx } from '../../../utils';
import { InterfaceOptions } from '../../InterfaceOptions';

import { AddonInterface } from './Addons';
import './HoverPreview.less';

export interface HoverPreviewOptions {
  frameCount: number;
  delayMilliseconds: number;
}

export const defaultHoverPreviewOptions: HoverPreviewOptions = {
  frameCount: 5,
  delayMilliseconds: 400,
};

export class HoverPreview implements AddonInterface {
  public static canBeEnabled = (
    _,
    playback: Playback | null,
    options: InterfaceOptions,
  ): boolean => {
    return !!(
      options.addons.hoverPreview &&
      playback &&
      playback.links.videoPreview &&
      playback.links.videoPreview.isTemplated()
    );
  };

  private options: HoverPreviewOptions = null;
  private animationInterval: number = null;
  private animationIndex: number = 0;
  private container: HTMLDivElement;
  private image: HTMLImageElement;
  private readonly width: number;

  public constructor(
    private plyr: Plyr.Plyr,
    private playback: Playback,
    options: InterfaceOptions,
  ) {
    this.applyOptions(options);

    this.width = this.getPlyrContainer().clientWidth;

    this.createContainer();

    this.addPlyrListeners();
  }

  public destroy = () => {
    if (!this.container) {
      return;
    }

    this.removePlyrListeners();

    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    this.getPlyrContainer().removeChild(this.container);
    this.container = null;
  };

  public getOptions = () => this.options;

  private applyOptions = (options: InterfaceOptions) => {
    if (options.addons.hoverPreview === true) {
      this.options = defaultHoverPreviewOptions;
    } else {
      this.options = options.addons.hoverPreview as HoverPreviewOptions;
    }

    // prettier-ignore
    this.options.frameCount = getBoundedValue(
      4,
      this.options.frameCount,
      15,
    );
    this.options.delayMilliseconds = getBoundedValue(
      200,
      this.options.delayMilliseconds,
      1000,
    );
  };

  private createContainer = () => {
    this.container = document.createElement('div');
    this.container.classList.add(
      'hover-preview',
      'hover-preview--hidden',
      'hover-preview--loading',
    );
    this.getPlyrContainer().append(this.container);

    const window = document.createElement('div');
    window.classList.add('hover-preview__window');
    this.container.appendChild(window);

    this.image = document.createElement('img');
    this.image.classList.add('hover-preview__image');
    this.image.src = this.playback.links.videoPreview.getTemplatedLink({
      thumbnailWidth: this.width,
      thumbnailCount: this.options.frameCount,
    });
    this.image.onload = () => {
      this.container.classList.remove('hover-preview--loading');
    };

    window.appendChild(this.image);
  };

  private addPlyrListeners = () => {
    this.getPlyrContainer().addEventListener('mouseover', this.handleMouseover);
    this.getPlyrContainer().addEventListener('mouseout', this.handleMouseout);
    this.plyr.on('play', this.destroy);
  };

  private removePlyrListeners = () => {
    this.getPlyrContainer().removeEventListener(
      'mouseover',
      this.handleMouseover,
    );
    this.getPlyrContainer().removeEventListener(
      'mouseout',
      this.handleMouseout,
    );
    this.plyr.off('play', this.destroy);
  };

  private handleMouseover = () => {
    if (this.animationInterval !== null) {
      return;
    }

    this.container.classList.remove('hover-preview--hidden');

    this.animationTick();
    this.animationInterval = window.setInterval(
      this.animationTick,
      this.options.delayMilliseconds,
    );
  };

  private handleMouseout = () => {
    this.container.classList.add('hover-preview--hidden');

    clearInterval(this.animationInterval);
    this.animationInterval = null;
    this.animationIndex = 0;
  };

  private animationTick = () => {
    if (this.container.classList.contains('hover-preview--loading')) {
      return;
    }

    this.setImageIndex(this.animationIndex);
    this.animationIndex = (this.animationIndex + 1) % this.options.frameCount;
  };

  private setImageIndex = (index: number) => {
    this.image.style.left = withPx(index * this.width * -1);
  };

  private getPlyrContainer = () => this.plyr.elements.container;
}
