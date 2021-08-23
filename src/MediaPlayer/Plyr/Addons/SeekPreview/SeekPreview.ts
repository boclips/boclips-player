import { formatDuration } from './../../../../utils/durationFormatter';
import { Playback } from '../../../../types/Playback';
import { EnrichedPlyr } from '../../../../types/plyr';
import { getBoundedValue, withPx } from '../../../../utils';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { AddonInterface } from '../Addons';
import './SeekPreview.less';
import { PlaybackSegment } from '../../../MediaPlayer';
import { AddonOptions } from '../../../../BoclipsPlayer/PlayerOptions';

export interface SeekPreviewOptions {
  /**
   * Number of frames to retrieve for distribution over the length
   * of the video.
   *
   * Minimum: 10
   * Maximum: 20
   */
  frameCount: number;
}

export const defaultSeekPreviewOptions: SeekPreviewOptions = {
  frameCount: 15,
};

export class SeekPreview implements AddonInterface {
  public static canBeEnabled = (
    plyr: EnrichedPlyr,
    playback: Playback | null,
    options: InterfaceOptions,
  ): boolean => {
    return !!(
      options.addons.seekPreview &&
      Math.ceil(plyr.elements.container.clientWidth * 0.25) >= 125 &&
      options.controls.indexOf('progress') !== -1 &&
      playback &&
      playback.links.videoPreview &&
      playback.links.videoPreview.isTemplated()
    );
  };

  private options: SeekPreviewOptions = null;
  private container: HTMLDivElement = null;
  private window: HTMLDivElement;
  private width: number;
  private height: number;
  private destroyed: boolean = false;
  private imageRatio: number;
  private segment: PlaybackSegment = null;

  public constructor(
    private plyr: EnrichedPlyr,
    private playback: Playback,
    options: AddonOptions,
  ) {
    this.applyOptions(options.interface);
    this.segment = options.segment;
    this.hidePlyrSeek();

    this.installPlyrListeners();
    this.createContainer();
  }

  public destroy = () => {
    if (this.destroyed) {
      return;
    }

    this.destroyContainer();

    if (this.getPlyrProgressBar()) {
      this.getPlyrProgressBar().removeEventListener(
        'mousemove',
        this.handleMousemove,
      );
      this.getPlyrProgressBar().removeEventListener(
        'mouseout',
        this.handleMouseout,
      );
    }

    this.destroyed = true;
  };

  public getOptions = () => this.options;

  private applyOptions = (options: InterfaceOptions) => {
    if (options.addons.seekPreview === true) {
      this.options = defaultSeekPreviewOptions;

      return;
    }

    this.options = options.addons.seekPreview as SeekPreviewOptions;

    this.options.frameCount = getBoundedValue(10, this.options.frameCount, 20);
  };

  private destroyContainer = () => {
    if (!this.container || !this.container.parentElement) {
      return;
    }

    this.container.parentElement.removeChild(this.container);
    this.container = null;
  };

  private installPlyrListeners = () => {
    this.plyr.on('enterfullscreen', this.updateDimensions);
    this.plyr.on('exitfullscreen', this.updateDimensions);

    const plyrProgressBar = this.getPlyrProgressBar();
    plyrProgressBar.addEventListener('mousemove', this.handleMousemove);
    plyrProgressBar.addEventListener('mouseout', this.handleMouseout);
  };

  private updateDimensions = () => {
    this.width = Math.ceil(this.plyr.elements.container.clientWidth * 0.25);
    this.height = this.width / this.imageRatio;

    this.window.style.height = withPx(this.height);
    this.container.style.width = withPx(this.width);
    this.container.style.marginLeft = withPx(this.width / -2);
  };

  private handleMousemove = (event: MouseEvent) => {
    if (this.hasBeenDestroyed()) {
      return;
    }
    const clientRect: ClientRect =
      this.getPlyrProgressBar().getBoundingClientRect();

    const seekTime = this.calculateSeekTime(clientRect, event.pageX);
    if (
      this.segment &&
      (seekTime < this.segment.start || seekTime > this.segment.end)
    ) {
      return;
    }

    this.container.classList.remove('seek-thumbnail--hidden');

    this.updatePreview(event.pageX);
  };

  private handleMouseout = () => {
    if (this.hasBeenDestroyed()) {
      return;
    }

    if (this.container) {
      this.container.classList.add('seek-thumbnail--hidden');
    }
  };

  private hidePlyrSeek = () => {
    this.getPlyrContainer().parentElement.classList.add('hide-plyr-seek');
  };

  private createContainer = () => {
    if (this.container) {
      this.destroyContainer();
    }

    this.container = document.createElement('div');
    this.container.classList.add('seek-thumbnail', 'seek-thumbnail--hidden');

    this.window = document.createElement('div');
    this.window.classList.add(
      'seek-thumbnail__window',
      'seek-thumbnail__window--loading',
    );
    this.updateDimensions();
    // this.window.style.height = withPx(this.height);

    const placeholderImage = document.createElement('img');
    placeholderImage.classList.add('seek-thumbnail__image--placeholder');
    placeholderImage.src = this.playback.links.thumbnail.getTemplatedLink({
      thumbnailWidth: this.plyr.elements.container.clientWidth,
    });

    const image = document.createElement('img');
    image.classList.add('seek-thumbnail__image');
    image.onload = () => {
      if (this.hasBeenDestroyed()) {
        return;
      }

      this.imageRatio =
        image.naturalWidth / image.naturalHeight / this.options.frameCount;

      this.window.classList.remove('seek-thumbnail__window--loading');
    };
    image.src = this.playback.links.videoPreview.getTemplatedLink({
      thumbnailWidth: this.width,
      thumbnailCount: this.options.frameCount,
    });

    const timeLabel = document.createElement('span');
    timeLabel.classList.add('seek-thumbnail__time');

    this.window.appendChild(image);
    this.window.appendChild(placeholderImage);
    this.container.appendChild(this.window);
    this.container.appendChild(timeLabel);

    this.getPlyrContainer().append(this.container);
  };

  private updatePreview = (cursorX: number) => {
    this.updateDimensions();

    const clientRect: ClientRect =
      this.getPlyrProgressBar().getBoundingClientRect();

    this.updatePosition(cursorX);

    const seekTime = this.calculateSeekTime(clientRect, cursorX);

    this.updateImageSlice(seekTime);
    this.updateTimeLabel(seekTime);
  };

  private calculateSeekTime(clientRect: ClientRect, cursorX: number) {
    const duration = this.playback.duration;

    const percentage = Math.min(
      100,
      Math.max(0, (100 / clientRect.width) * (cursorX - clientRect.left)),
    );

    return duration * (percentage / 100);
  }

  private updatePosition(cursorX: number) {
    const parentClientRect =
      this.container.parentElement.getBoundingClientRect();
    this.container.style.left = withPx(cursorX - parentClientRect.left);
  }

  private updateImageSlice = (seekTime: number) => {
    const duration = this.playback.duration;
    const index = Math.max(
      0,
      Math.ceil((this.options.frameCount * seekTime) / duration) - 1,
    );

    const img: HTMLImageElement = this.container.querySelector(
      '.seek-thumbnail__image',
    );
    img.style.left = withPx(index * this.width * -1);
  };

  private updateTimeLabel = (seconds: number) => {
    const label = this.container.querySelector('.seek-thumbnail__time');

    label.textContent = formatDuration(Math.ceil(seconds));
  };

  private getPlyrProgressBar = () =>
    this.plyr && this.plyr.elements && this.plyr.elements.progress;

  private getPlyrContainer = () =>
    this.plyr && this.plyr.elements && this.plyr.elements.container;

  private hasBeenDestroyed = (): boolean => this.destroyed;
}
