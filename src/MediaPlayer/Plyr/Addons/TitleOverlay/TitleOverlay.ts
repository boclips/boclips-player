import { AddonInterface } from '../Addons';
import { EnrichedPlyr } from '../../../../types/plyr';
import { Playback } from '../../../../types/Playback';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { PlaybackSegment } from '../../../MediaPlayer';
// @ts-ignore
import LogoSVG from '../../../../resources/icons/boclips-logo.svg';
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

    const title = document.createElement('span');
    title.innerText = this.videoTitle;
    title.textContent = this.videoTitle;
    titleContainer.appendChild(title);

    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');

    const cp = document.createElement('div');
    cp.innerHTML = `Produced by <span>${playback.createdBy}</span>`;
    cp.classList.add('createdBy');
    wrapper.appendChild(cp);

    const logoWrapper = document.createElement('div');
    logoWrapper.classList.add('logo');

    const logoSVG = document.createElement('div');
    const logoText = document.createElement('span');
    logoText.innerText = 'Powered by';
    logoSVG.innerHTML = LogoSVG;

    logoWrapper.append(logoText);
    logoWrapper.append(logoSVG);

    wrapper.appendChild(logoWrapper);

    titleContainer.appendChild(wrapper);
    plyr.elements.container.appendChild(titleContainer);

    plyr.on('controlsshown', () => this.show(titleContainer));
    plyr.on('controlshidden', () => this.hide(titleContainer));
  }

  public static isEnabled(
    _plyr: EnrichedPlyr,
    playback: Playback,
    options: InterfaceOptions,
  ): boolean {
    return !!(
      options.addons.titleOverlay &&
      playback &&
      playback.title &&
      playback.type !== 'YOUTUBE'
    );
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
