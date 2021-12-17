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
  listeners: {
    media: () => void;
  };
  ready: boolean;
}

export type EnrichedPlyr = Plyr & MissingPlyrProperties;
