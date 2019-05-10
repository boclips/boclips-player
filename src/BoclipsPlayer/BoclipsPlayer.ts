import { Provider, ProviderConstructor } from '../Provider/Provider';

interface BoclipsPlayerInstance {
  getContainer: () => HTMLElement;
  getProvider: () => Provider;
}

export class BoclipsPlayer implements BoclipsPlayerInstance {
  private readonly container: HTMLElement;
  private video: HTMLVideoElement;
  private provider: Provider;
  private readonly providerConstructor: ProviderConstructor;

  constructor(
    providerConstructor: ProviderConstructor,
    container: HTMLElement,
  ) {
    this.providerConstructor = providerConstructor;
    // TODO: Validate the arguments.

    this.container = container;

    this.video = document.createElement('video');
    this.video.setAttribute('data-qa', 'boclips-player');

    this.container.appendChild(this.video);

    this.provider = new this.providerConstructor(this.video);
  }

  public getContainer = () => {
    return this.container;
  };

  public getProvider = () => this.provider;
}
