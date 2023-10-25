import { parse, toSeconds } from 'iso8601-duration';
import { Link } from '../types/Link';
import {
  Playback,
  PodcastPlayback,
  StreamPlayback,
  YoutubePlayback,
} from '../types/Playback';

const convertPlaybackResource = (
  videoResource,
): StreamPlayback | YoutubePlayback | PodcastPlayback => {
  const rawPlayback = videoResource.playback;
  if (!['STREAM', 'YOUTUBE', 'PODCAST'].includes(rawPlayback.type)) {
    throw new Error(`Playback type ${rawPlayback.type} not supported`);
  }

  const playback: Playback = {
    title: videoResource.title,
    type: rawPlayback.type,
    id: rawPlayback.id,
    duration: toSeconds(parse(rawPlayback.duration)),
    links: {
      createPlaybackEvent: new Link(rawPlayback._links.createPlaybackEvent),
      createPlayerInteractedWithEvent: new Link(
        rawPlayback._links.createPlayerInteractedWithEvent,
      ),
    },
  };

  if (rawPlayback._links.hlsStream) {
    playback.links.hlsStream = new Link(rawPlayback._links.hlsStream);
  }

  if (rawPlayback._links.thumbnail) {
    playback.links.thumbnail = new Link(rawPlayback._links.thumbnail);
  }

  if (rawPlayback._links.videoPreview) {
    playback.links.videoPreview = new Link(rawPlayback._links.videoPreview);
  }

  return playback;
};

export default convertPlaybackResource;
