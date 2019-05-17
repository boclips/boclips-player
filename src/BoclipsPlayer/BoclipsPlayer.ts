import uuid from 'uuid/v1';
import { EventTracker } from '../Analytics/EventTracker';
import { Video } from '../types/Video';
import retrieveVideo from '../utils/retrieveVideo';
import { Wrapper, WrapperConstructor } from '../Wrapper/Wrapper';

interface BoclipsPlayerInstance {
  play: () => Promise<any>;
  pause: () => void;
}

export class BoclipsPlayer implements BoclipsPlayerInstance {
  private readonly wrapperConstructor: WrapperConstructor;
  private readonly wrapper: Wrapper;
  private readonly container: HTMLElement;
  private readonly eventTracker: EventTracker;
  // @ts-ignore
  private options: BoclipsPlayerOptions = {};
  private video: Video;
  private playerId: string = uuid();

  constructor(
    wrapperConstructor: WrapperConstructor,
    container: HTMLElement,
    options: BoclipsPlayerOptions = {},
  ) {
    if (!wrapperConstructor) {
      throw Error(
        `IllegalArgument: Expected a valid WrapperConstructor. Given ${wrapperConstructor}`,
      );
    }
    if (false === (container instanceof Node && document.contains(container))) {
      throw Error(
        `IllegalArgument: Container element ${container} must be a node within the document body.`,
      );
    }
    this.wrapperConstructor = wrapperConstructor;
    this.container = container;
    this.options = options;

    this.eventTracker = new EventTracker(this.playerId);

    this.wrapper = new this.wrapperConstructor(container, this.eventTracker);

    const videoUriAttribute = container.getAttribute('data-boplayer-video-uri');
    if (videoUriAttribute) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadVideo(videoUriAttribute);
    }
  }

  public loadVideo = async (videoUri: string) => {
    return retrieveVideo(videoUri).then((video: Video) => {
      this.video = video;
      this.eventTracker.configure(video);
      this.wrapper.configureWithVideo(video);
    });
  };

  public getContainer = () => this.container;

  public getWrapper = () => this.wrapper;

  public getEventTracker = () => this.eventTracker;

  public getVideo = (): Video => this.video;

  public play = (): Promise<void> => this.wrapper.play();

  public pause = (): void => this.wrapper.pause();
}
