import { Playback } from '../../../types/Playback';
import { InterfaceOptions } from '../../InterfaceOptions';
import { AddonInterface } from './Addons';
import './SeekPreview.less';

export class SeekPreview implements AddonInterface {
  public static canBeEnabled = (
    playback: Playback | null,
    options: InterfaceOptions,
  ) => {
    if (!options.seekPreview) {
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
  private static SLICE_COUNT = 10;

  private previewContainer: HTMLDivElement = null;

  // @ts-ignore
  public constructor(private plyr, private playback: Playback) {
    this.plyr.elements.progress.addEventListener(
      'mousemove',
      this.handleMousemove,
    );
  }

  public destroy = () => {
    if (this.previewContainer) {
      document.body.removeChild(this.previewContainer);
      this.previewContainer = null;
    }
    if (this.plyr && this.plyr.elements.progress) {
      this.plyr.elements.progress.removeEventListener(
        'mousemove',
        this.handleMousemove,
      );
    }
  };

  private handleMousemove = (event: MouseEvent) => {
    if (!this.previewContainer) {
      this.createContainer();
    }

    this.updatePreview(event.pageX);
  };

  private createContainer = () => {
    // TODO: Replace with aspect check?
    // noinspection JSSuspiciousNameCombination
    const height = SeekPreview.CONTAINER_WIDTH;

    const container = document.createElement('div');
    container.classList.add('seek-thumbnail');
    container.style.width = this.withPx(SeekPreview.CONTAINER_WIDTH);
    container.style.height = this.withPx(height);
    container.style.marginLeft = this.withPx(SeekPreview.CONTAINER_WIDTH / -2);

    const img = document.createElement('img');
    img.src = this.playback.links.thumbnailApi.getTemplatedLink({
      thumbnailWidth: SeekPreview.CONTAINER_WIDTH,
      videoSlices: SeekPreview.SLICE_COUNT,
    });

    container.appendChild(img);

    document.body.append(container);

    this.previewContainer = container;
  };

  private updatePreview = (cursorX: number) => {
    const clientRect: ClientRect = this.plyr.elements.progress.getBoundingClientRect();

    this.updatePosition(cursorX, clientRect);

    const percentage = Math.min(
      100,
      Math.max(0, (100 / clientRect.width) * (cursorX - clientRect.left)),
    );

    const duration = this.playback.duration;

    const seekTime = duration * (percentage / 100);

    const sliceToShowIndex = Math.max(
      0,
      Math.ceil((SeekPreview.SLICE_COUNT * seekTime) / duration) - 1,
    );

    this.showImageFrame(sliceToShowIndex);

    // Determine 'time' hovered over
    // Determine slice to show
    // Offset background
  };

  private updatePosition(cursorX: number, clientRect: ClientRect) {
    this.previewContainer.style.left = this.withPx(cursorX);
    this.previewContainer.style.top = this.withPx(
      clientRect.top - this.withoutPx(this.previewContainer.style.height),
    );
  }

  private showImageFrame = (index: number) => {
    const img = this.previewContainer.querySelector('img');
    img.style.left = this.withPx(index * SeekPreview.CONTAINER_WIDTH * -1);
  };

  private withPx = (value: string | number) => `${value}px`;
  private withoutPx = (value: string): number =>
    parseInt(value.replace(/px/, ''), 10);
}
