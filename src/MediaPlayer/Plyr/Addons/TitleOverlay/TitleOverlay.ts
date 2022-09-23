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
    const titleContainer = document.createElement('div');
    titleContainer.classList.add('video-title');

    const title = document.createElement('h1');
    title.innerText = this.videoTitle;
    titleContainer.appendChild(title);

    const logo = document.createElement('div');
    logo.classList.add('logo');
    titleContainer.appendChild(logo);

    plyr.elements.container.appendChild(titleContainer);
    plyr.on('controlsshown', () => this.show(titleContainer));
    plyr.on('controlshidden', () => this.hide(titleContainer));
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
