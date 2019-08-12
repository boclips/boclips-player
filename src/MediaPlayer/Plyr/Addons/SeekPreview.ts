import { format } from 'date-fns';
import { Playback } from '../../../types/Playback';
import { withPx } from '../../../utils';
import { InterfaceOptions } from '../../InterfaceOptions';
import { AddonInterface } from './Addons';
import './SeekPreview.less';

export interface SeekPreviewOptions {
  sliceCount: number;
}

export const defaultSeekPreviewOptions: SeekPreviewOptions = {
  sliceCount: 10,
};

export class SeekPreview implements AddonInterface {
  public static canBeEnabled = (
    playback: Playback | null,
    options: InterfaceOptions,
  ) => {
    if (!options.addons.seekPreview) {
      return false;
    }

    if (options.controls.indexOf('progress') === -1) {
      return false;
    }

    if (!playback) {
      return false;
    }

    return !!playback.links.thumbnailApi;
  };

  public static CONTAINER_WIDTH = 175;

  private options: SeekPreviewOptions = null;
  private container: HTMLDivElement = null;

  public constructor(
    options: InterfaceOptions,
    private plyr,
    private playback: Playback,
  ) {
    if (options.addons.seekPreview === true) {
      this.options = defaultSeekPreviewOptions;
    } else {
      this.options = options.addons.seekPreview as SeekPreviewOptions;
    }

    this.createContainer();

    this.getPlyrProgressBar().addEventListener(
      'mousemove',
      this.handleMousemove,
    );
    this.getPlyrProgressBar().addEventListener('mouseout', this.handleMouseout);
  }

  public destroy = () => {
    if (this.container) {
      this.container.parentElement.removeChild(this.container);
      this.container = null;
    }
    if (this.plyr && this.getPlyrProgressBar()) {
      this.getPlyrProgressBar().removeEventListener(
        'mousemove',
        this.handleMousemove,
      );
      this.getPlyrProgressBar().removeEventListener(
        'mouseout',
        this.handleMouseout,
      );
    }
  };

  private handleMousemove = (event: MouseEvent) => {
    this.container.classList.remove('seek-thumbnail--hidden');

    this.updatePreview(event.pageX);
  };

  private handleMouseout = () => {
    if (this.container) {
      this.container.classList.add('seek-thumbnail--hidden');
    }
  };

  private createContainer = () => {
    const media = this.plyr.media;
    const aspectRatio = media.clientHeight / media.clientWidth;
    const height = SeekPreview.CONTAINER_WIDTH * aspectRatio;

    const container = document.createElement('div');
    container.classList.add('seek-thumbnail', 'seek-thumbnail--hidden');
    container.style.width = withPx(SeekPreview.CONTAINER_WIDTH);
    container.style.marginLeft = withPx(SeekPreview.CONTAINER_WIDTH / -2);

    const imageWindow = document.createElement('div');
    imageWindow.classList.add('seek-thumbnail__window');
    imageWindow.style.height = withPx(height);

    const img = document.createElement('img');
    img.classList.add('seek-thumbnail__image');
    img.src = this.playback.links.thumbnailApi.getTemplatedLink({
      thumbnailWidth: SeekPreview.CONTAINER_WIDTH,
      videoSlices: this.options.sliceCount,
    });

    const timeLabel = document.createElement('span');
    timeLabel.classList.add('seek-thumbnail__time');

    imageWindow.appendChild(img);
    container.appendChild(imageWindow);
    container.appendChild(timeLabel);

    this.getPlyrContainer().append(container);

    this.container = container;
  };

  private updatePreview = (cursorX: number) => {
    const clientRect: ClientRect = this.getPlyrProgressBar().getBoundingClientRect();

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
    const parentClientRect = this.container.parentElement.getBoundingClientRect();
    this.container.style.left = withPx(cursorX - parentClientRect.left);
  }

  private updateImageSlice = (seekTime: number) => {
    const duration = this.playback.duration;
    const index = Math.max(
      0,
      Math.ceil((this.options.sliceCount * seekTime) / duration) - 1,
    );

    const img: HTMLImageElement = this.container.querySelector(
      '.seek-thumbnail__image',
    );
    img.style.left = withPx(index * SeekPreview.CONTAINER_WIDTH * -1);
  };

  private updateTimeLabel = (seconds: number) => {
    const label = this.container.querySelector('.seek-thumbnail__time');

    let pattern = 'm:ss';
    if (seconds >= 60 * 60) {
      pattern = 'h:mm:ss';
    }

    label.textContent = format(seconds * 1000, pattern);
  };

  private getPlyrProgressBar = () => this.plyr.elements.progress;

  private getPlyrContainer = () => this.plyr.elements.container;
}
