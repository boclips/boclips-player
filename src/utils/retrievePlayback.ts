import axios from 'axios';
import convertPlaybackResource, { Playback } from './convertPlaybackResource';

const retrievePlayback = async (uri: string): Promise<Playback> => {
  return await axios
    .post(uri)
    .then(response => response.data)
    .then(convertPlaybackResource);
};

export default retrievePlayback;
