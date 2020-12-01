import { Playback } from '../../../../types/Playback';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { EnrichedPlyr } from '../../../../types/plyr';
import './VideoLengthPreview.less';

import { AddonInterface } from '../Addons';
import { formatDuration } from '../../../../utils/durationFormatter';

export class VideoLengthPreview implements AddonInterface {
  public static canBeEnabled = (
    _,
    playback: Playback | null,
    options: InterfaceOptions,
  ): boolean => {
    return !!(
      options.addons.videoLengthPreview &&
      playback &&
      playback.type === 'STREAM'
    );
  };

  private container: HTMLDivElement;
  private destroyed: boolean = false;

  public constructor(private plyr: EnrichedPlyr, private playback: Playback) {
    this.createContainer();
    this.addListeners();
  }

  public destroy = () => {
    if (this.destroyed) {
      return;
    }
    this.getPlyrContainer().removeChild(this.container);
    this.container = null;
    this.getPlyrContainer().removeEventListener('play', this.destroy);
    this.destroyed = true;
  };

  private createContainer = () => {
    this.container = document.createElement('div');
    this.container.classList.add('video-length-preview');
    this.container.innerHTML = formatDuration(this.playback.duration);
    this.getPlyrContainer().prepend(this.container);
  };

  private addListeners = () => {
    this.plyr.on('play', this.destroy);
  };

  private getPlyrContainer = () =>
    this.plyr && this.plyr.elements && this.plyr.elements.container;
}