interface PlayerEvent {
  videoId: string;
  videoDurationSeconds: number;
}

export interface PlaybackEvent extends PlayerEvent {
  segmentStartSeconds: number;
  segmentEndSeconds: number;
  videoIndex?: number;
}

export interface PlayerInteractedWithEvent<
  T extends keyof InteractionEventPayload,
> extends PlayerEvent {
  currentTime: number;
  subtype: T;
  payload: InteractionEventPayload[T];
}

export interface InteractionEventPayload {
  captionsEnabled: {
    kind: string;
    language: string;
    label: string;
  };
  captionsLanguageChanged: {
    kind: string;
    language: string;
    label: string;
  };
  captionsDisabled: EmptyObject;
  fullscreenEnabled: EmptyObject;
  fullscreenDisabled: EmptyObject;
  seeking: EmptyObject;
  seeked: EmptyObject;
  progress: EmptyObject;
  speedChanged: {
    speed: number;
  };
  jumpedForward: EmptyObject;
  jumpedBackward: EmptyObject;
  muted: EmptyObject;
  unmuted: EmptyObject;
  play: EmptyObject;
  pause: EmptyObject;
  playbackStarted: EmptyObject;
}

interface EmptyObject {
  [key: string]: never;
}
