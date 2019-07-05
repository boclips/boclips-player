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
  captionsEnabled: {
    id: string;
    kind: string;
    language: string;
    label: string;
  };
  captionsChanged: {
    id: string;
    kind: string;
    language: string;
    label: string;
  };
  captionsDisabled: EmptyObject;
  fullscreenEnabled: EmptyObject;
  fullscreenDisabled: EmptyObject;
  speedChanged: {
    speed: number;
  };
  jumpedForward: EmptyObject;
  jumpedBackward: EmptyObject;
  muted: EmptyObject;
  unmuted: EmptyObject;
}

interface EmptyObject {
  [key: string]: never;
}
