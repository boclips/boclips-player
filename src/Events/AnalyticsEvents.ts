export interface PlaybackEvent {
  playerId?: string;
  videoId: string;
  segmentStartSeconds: number;
  segmentEndSeconds: number;
  videoDurationSeconds: number;
  captureTime: Date;
}
