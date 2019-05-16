import { Provider, ProviderConstructor } from '../Provider/Provider';
import { Playback } from '../utils/convertPlaybackResource';
import convertPlaybackToSources from '../utils/convertPlaybackToSources';
import retrievePlayback from '../utils/retrievePlayback';

interface BoclipsPlayerInstance {
  play: () => Promise<any>;
  pause: () => void;
}

export class BoclipsPlayer implements BoclipsPlayerInstance {
  private readonly providerConstructor: ProviderConstructor;
  private readonly container: HTMLElement;
  private readonly provider: Provider;
  // @ts-ignore
  private options: BoclipsPlayerOptions = {};
  private playback: Playback;

  constructor(
    providerConstructor: ProviderConstructor,
    container: HTMLElement,
    options: BoclipsPlayerOptions = {},
  ) {
    if (!providerConstructor) {
      throw Error(
        `IllegalArgument: Expected a valid ProviderConstructor. Given ${providerConstructor}`,
      );
    }
    if (false === (container instanceof Node && document.contains(container))) {
      throw Error(
        `IllegalArgument: Container element ${container} must be a node within the document body.`,
      );
    }
    this.providerConstructor = providerConstructor;
    this.container = container;
    this.options = options;

    const video = document.createElement('video');
    video.setAttribute('data-qa', 'boclips-player');

    this.container.appendChild(video);

    this.provider = new this.providerConstructor(video);
  }

  public loadVideo = async (videoUri: string) => {
    return retrievePlayback(videoUri).then(this.applyPlayback);
  };

  private applyPlayback = (playback: Playback) => {
    this.provider.source = convertPlaybackToSources(playback);
    this.playback = playback;
  };

  public getContainer = () => this.container;

  public getProvider = () => this.provider;

  public getPlayback = (): Playback => this.playback;

  public play = (): Promise<void> => {
    return this.provider.play();
  };

  public pause = (): void => {
    this.provider.pause();
  };
}
