export interface Playback {
  streamUrl: string;
}

const convertPlaybackResource = (data: any): Playback => ({
  streamUrl: data.streamUrl,
});

export default convertPlaybackResource;
