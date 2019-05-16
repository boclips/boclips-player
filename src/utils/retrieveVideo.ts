import axios from 'axios';
import { Video } from '../types/Video';
import convertVideoResource from './convertVideoResource';

const retrieveVideo = async (uri: string): Promise<Video> => {
  return await axios
    .get(uri)
    .then(response => response.data)
    .then(convertVideoResource);
};

export default retrieveVideo;
