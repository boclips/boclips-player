import { AddonInterface } from '../Addons';
import { EnrichedPlyr } from '../../../../types/plyr';
import { Playback } from '../../../../types/Playback';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { PlaybackSegment } from '../../../MediaPlayer';
import './TitleOverlay.scss';

export class TitleOverlay implements AddonInterface {
  private readonly videoTitle: string;

  public constructor(
    plyr: EnrichedPlyr,
    playback: Playback,
    _options: InterfaceOptions,
  ) {
    this.videoTitle = playback.title;
    const titleElement = document.createElement('h1');
    titleElement.classList.add('video-title');
    titleElement.textContent = this.videoTitle;
    plyr.elements.container.appendChild(titleElement);
    plyr.on('controlsshown', () => this.show(titleElement));
    plyr.on('controlshidden', () => this.hide(titleElement));
  }
  public static isEnabled(
    _plyr: EnrichedPlyr,
    playback: Playback,
    options: InterfaceOptions,
  ): boolean {
    return !!(options.addons.titleOverlay && playback && playback.title);
  }

  private show(titleElement: Element) {
    titleElement.classList.remove('hide');
  }

  private hide(titleElement: Element) {
    titleElement.classList.add('hide');
  }

  destroy(): void {}

  updateSegment(_segment: PlaybackSegment): void {}
}
