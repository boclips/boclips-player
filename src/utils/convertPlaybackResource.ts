export interface Playback {
  streamUrl: string;
  thumbnailUrl: string;
}

const convertPlaybackResource = (data: any): Playback => ({
  streamUrl: data.playback.streamUrl,
  thumbnailUrl: data.playback.thumbnailUrl,
});

export default convertPlaybackResource;
