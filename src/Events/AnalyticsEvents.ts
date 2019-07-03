interface PlayerEvent {
  playerId?: string;
  videoId: string;
  videoDurationSeconds: number;
}

export interface PlaybackEvent extends PlayerEvent {
  segmentStartSeconds: number;
  segmentEndSeconds: number;
  videoIndex?: number;
}

export interface PlayerInteractedWithEvent<
  T extends keyof InteractionEventPayload
> extends PlayerEvent {
  currentTime: number;
  subtype: T;
  payload: InteractionEventPayload[T];
}

export interface InteractionEventPayload {
  'captions-on': {
    id: string;
    kind: string;
    language: string;
    label: string;
  };
  'captions-change': {
    id: string;
    kind: string;
    language: string;
    label: string;
  };
  'captions-off': EmptyObject;
  'fullscreen-on': EmptyObject;
  'fullscreen-off': EmptyObject;
  'speed-change': {
    speed: number;
  };
  'fast-forward': EmptyObject;
  rewind: EmptyObject;
}

interface EmptyObject {
  [key: string]: never;
}
