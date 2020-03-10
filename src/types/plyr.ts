import Plyr from 'plyr';

interface MissingPlyrProperties {
  media: HTMLVideoElement;
  captions: {
    active: boolean;
    currentTrackNode: any;
  };
  elements: {
    [key: string]: HTMLElement;
  };
}

export type EnrichedPlyr = Plyr & MissingPlyrProperties;
