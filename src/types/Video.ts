import { Link } from './Link';
import { PlaybackType } from './Playback';

interface VideoLinks {
  self: Link;
}
export interface Video {
  id: string;
  playback: PlaybackType;
  links: VideoLinks;
  title: string;
  description: string;
}
