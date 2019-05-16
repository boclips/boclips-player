export interface Playback {
  type: 'YOUTUBE' | 'STREAM';
  // If type is STREAM
  streamUrl?: string;
  // If type is YOUTUBE
  id?: string;
  thumbnailUrl: string;
  duration: string;
}

const convertPlaybackResource = (data: any): Playback => ({
  type: data.playback.type,
  streamUrl: data.playback.streamUrl,
  id: data.playback.id,
  thumbnailUrl: data.playback.thumbnailUrl,
  duration: data.playback.duration,
});

export default convertPlaybackResource;
