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
  'fullscreen-on': EmptyObject;
  'fullscreen-off': EmptyObject;
}

interface EmptyObject {
  [key: string]: never;
}
