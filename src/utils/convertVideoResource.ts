import { Link } from '../types/Link';
import { Video } from '../types/Video';
import convertPlaybackResource from './convertPlaybackResource';

const convertVideoResource = (data: any): Video => ({
  id: data.id,
  playback: convertPlaybackResource(data),
  links: {
    self: new Link(data._links.self),
  },
  title: data.title,
  description: data.description,
});

export default convertVideoResource;
