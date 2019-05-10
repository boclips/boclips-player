export type ProviderConstructor = new (video: HTMLVideoElement) => Provider;

export interface Provider {
  play: () => void;
}
