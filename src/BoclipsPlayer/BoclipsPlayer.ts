import { PlayerLibrary } from '../Player/Player';

interface BoclipsPlayerInstance {
  getContainer: () => HTMLElement;
}

export class BoclipsPlayer implements BoclipsPlayerInstance {
  private readonly playerLibrary: PlayerLibrary;
  private readonly container: HTMLElement;
  private video: HTMLVideoElement;

  constructor(playerLibrary: PlayerLibrary, container: HTMLElement) {
    this.playerLibrary = playerLibrary;
    // TODO: Validate the arguments.

    this.container = container;
  }

  public initialise = () => {
    this.video = document.createElement('video');
    this.video.setAttribute('data-qa', 'boclips-player');

    this.container.appendChild(this.video);

    this.playerLibrary.initialise(this.video);
  };

  public getContainer = () => {
    return this.container;
  };
}
