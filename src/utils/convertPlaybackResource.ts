export interface Playback {
  streamUrl: string;
  thumbnailUrl: string;
}

const convertPlaybackResource = (data: any): Playback => ({
  streamUrl: data.streamUrl,
  thumbnailUrl: data.thumbnailUrl,
});

export default convertPlaybackResource;
