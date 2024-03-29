import { Playback } from '../../../../types/Playback';
import { getBoundedValue, withPx } from '../../../../utils';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { EnrichedPlyr } from '../../../../types/plyr';
import { PlaybackSegment } from '../../../MediaPlayer';

import { AddonInterface } from '../Addons';
import './HoverPreview.scss';

export interface HoverPreviewOptions {
  /**
   * Number of frames to retrieve for distribution over the length
   * of the video.
   *
   * Minimum: 4
   * Maximum: 15
   */
  frameCount: number;
  /**
   * Number of ms each thumbnail is displayed for
   *
   * Minimum: 200
   * Maximum: 1000
   */
  delayMilliseconds: number;
}

export const defaultHoverPreviewOptions: HoverPreviewOptions = {
  frameCount: 5,
  delayMilliseconds: 400,
};

export class HoverPreview implements AddonInterface {
  public constructor(
    private plyr: EnrichedPlyr,
    private playback: Playback,
    options: InterfaceOptions,
  ) {
    this.applyOptions(options);

    this.createContainer();

    this.addListeners();
  }

  public static isEnabled = (
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
  private destroyed: boolean = false;
  private imageRatio: number;

  public destroy = () => {
    if (this.destroyed) {
      return;
    }

    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    if (this.plyr) {
      this.plyr.off('play', this.destroy);
    }

    if (this.getPlyrContainer()) {
      this.getPlyrContainer().removeEventListener(
        'mouseover',
        this.handleMouseover,
      );
      this.getPlyrContainer().removeEventListener(
        'mouseout',
        this.handleMouseout,
      );
      this.getPlyrContainer().removeChild(this.container);
      this.container = null;
    }

    this.destroyed = true;
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
      thumbnailWidth: this.calculateWidthOfPlayer(),
      thumbnailCount: this.options.frameCount,
    });
    this.image.onload = () => {
      if (this.hasBeenDestroyed()) {
        return;
      }

      this.imageRatio =
        this.image.naturalWidth /
        this.image.naturalHeight /
        this.options.frameCount;

      this.container.classList.remove('hover-preview--loading');
    };

    window.appendChild(this.image);
  };

  private addListeners = () => {
    this.getPlyrContainer().addEventListener('mouseover', this.handleMouseover);
    this.getPlyrContainer().addEventListener('mouseout', this.handleMouseout);
    this.plyr.on('play', this.destroy);
    this.container.addEventListener('click', () => {
      if (this.hasBeenDestroyed()) {
        return;
      }

      this.plyr.play();
    });
  };

  private handleMouseover = () => {
    if (this.hasBeenDestroyed()) {
      return;
    }

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
    if (this.hasBeenDestroyed()) {
      return;
    }

    this.container.classList.add('hover-preview--hidden');

    clearInterval(this.animationInterval);
    this.animationInterval = null;
    this.animationIndex = 0;
  };

  private animationTick = () => {
    if (this.hasBeenDestroyed()) {
      return;
    }

    if (this.container.classList.contains('hover-preview--loading')) {
      return;
    }

    const adjustedWidth = Math.min(
      this.getPlyrContainer().clientHeight * this.imageRatio,
      this.getPlyrContainer().clientWidth,
    );

    const window = this.image.parentElement;

    window.style.width = adjustedWidth + 'px';
    window.style.height = adjustedWidth / this.imageRatio + 'px';

    this.setImageIndex(this.animationIndex);
    this.animationIndex = (this.animationIndex + 1) % this.options.frameCount;
  };

  private setImageIndex = (index: number) => {
    this.image.style.left = withPx(
      index * this.image.parentElement.clientWidth * -1,
    );
  };

  private calculateWidthOfPlayer = () => this.getPlyrContainer().clientWidth;

  private getPlyrContainer = () =>
    this.plyr && this.plyr.elements && this.plyr.elements.container;

  private hasBeenDestroyed = (): boolean => this.destroyed;

  public updateSegment = (_: PlaybackSegment): void => {};
}
