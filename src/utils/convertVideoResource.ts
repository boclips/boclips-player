import { Video } from '../types/Video';
import convertPlaybackResource from './convertPlaybackResource';

const convertVideoResource = (data: any): Video => ({
  id: data.id,
  playback: convertPlaybackResource(data.playback),
});

export default convertVideoResource;
